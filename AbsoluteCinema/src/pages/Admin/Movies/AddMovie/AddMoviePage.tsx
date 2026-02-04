import { useCallback, useEffect, useState } from 'react';
import { data, useNavigate } from 'react-router-dom';
import styles from './AddMoviePage.module.css';
import { MovieAddForm } from '../../../../components/MovieAddForm/MovieForm';
import { CreateMovieRequest, MovieFormData } from '../../../../types/CreateMovieRequest';
import { createMovie, attachPersonToMovie, attachGenreToMovie, getGenres } from '../../../../api/movies';
import { SessionManager } from '@/components/SessionManager/SessionManager';
import { getDatesInRange } from '@/utils/getDatesInRange';
import { createSession, getHallById, getHalls } from '@/api';
import { Hall, mapHallDetailsFromApi, mapHallsListFromApi, SeatType } from '@/types/hall';
import { prepareSessionPayload } from '@/utils/prepareSessionPayload';

interface SessionFormData {
    id: string;
    dateFrom: string;
    dateTo: string;
    time: string;
    hall: string;
    seatPrices: Record<string, string>;
    enabledTypes: Record<string, boolean>;
}

export const AddMoviePage = () => {
    const [halls, setHalls] = useState<Hall[]>([]);
    const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
    const [loadingHalls, setLoadingHalls] = useState<Record<string, boolean>>({});
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<MovieFormData>({
        movieName: 'Add Movie Title',
        description: '',
        rate: 0,
        ageLimit: 0,
        duration: '',
        country: '',
        studio: '',
        language: '',
        genres: [],
        directors: [],
        starring: [],
        poster: null as File | null
    });

    const [sessions, setSessions] = useState<SessionFormData[]>([
        {
            id: '1',
            dateFrom: '',
            dateTo: '',
            time: '11:00',
            hall: '',
            seatPrices: {},
            enabledTypes: {},
        }
    ]);

    const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                poster: file
            }));
        }
    };

    const addSession = () => {
        const newSession: SessionFormData = {
            id: Date.now().toString(),
            dateFrom: '',
            dateTo: '',
            time: '11:00',
            hall: '',
            seatPrices: {},
            enabledTypes: {},
        };
        setSessions(prev => [...prev, newSession]);
    };

    const removeSession = (id: string) => {
        if (sessions.length > 1) {
            setSessions(prev => prev.filter(session => session.id !== id));
        }
    };

    useEffect(() => {
        const fetchHalls = async () => {
            try {
                const data = await getHalls();
                setHalls(mapHallsListFromApi(data));
            } catch (err) {
                console.error('Failed to fetch halls:', err);
                setError('Failed to load halls');
            }
        };
        fetchHalls();
    }, []);

    const loadHallDetails = async (hallId: string, sessionId: string) => {
        try {
            const data = await getHallById(hallId);
            const { seats, availableSeatTypes } = mapHallDetailsFromApi(data);

            setHalls(prev => prev.map(h =>
                h.id === hallId ? { ...h, seats, availableSeatTypes } : h
            ));
            const defaultEnabled = availableSeatTypes.reduce((acc: Record<string, boolean>, type: SeatType) => {
                acc[type.id] = true;
                return acc;
            }, {} as Record<string, boolean>);

            setSessions(prev => prev.map(session => {
                if (session.id !== sessionId) return session;
                const mergedPrices = { ...session.seatPrices };
                availableSeatTypes.forEach(type => {
                    if (mergedPrices[type.id] === undefined) {
                        mergedPrices[type.id] = '';
                    }
                });
                return { ...session, enabledTypes: defaultEnabled, seatPrices: mergedPrices };
            }));

        } catch (err) {
            console.error('Failed to load hall details:', err);
        } finally {
            setLoadingHalls(prev => ({ ...prev, [hallId]: false }));
        }
    };

    const handleSessionChange = useCallback((id: string, field: keyof SessionFormData, value: any) => {
        setSessions(prev => prev.map(session =>
            session.id === id ? { ...session, [field]: value } : session
        ));

        if (field === 'hall' && value) {
            loadHallDetails(value, id);
        }
    }, [loadHallDetails]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const moviePayload: CreateMovieRequest = {
                movieName: formData.movieName,
                description: formData.description,
                rate: Number(formData.rate),
                ageLimit: Number(formData.ageLimit),
                duration: formData.duration,
                country: formData.country,
                studio: formData.studio,
                language: formData.language,
                genres: formData.genres
            };

            const movieResult = await createMovie(moviePayload as any);
            const newMovieId = movieResult.movieId?.id ?? movieResult.id;

            // Attach Genres to Movie
            if (formData.genres && formData.genres.length > 0) {
                const allGenres = await getGenres();
                const genreList = Array.isArray(allGenres) ? allGenres : allGenres.genres || [];
                
                for (const genreName of formData.genres) {
                    const genre = genreList.find((g: any) => g.name === genreName);
                    if (genre) {
                        try {
                            await attachGenreToMovie(newMovieId, genre.id);
                        } catch (err) {
                            console.error(`Failed to attach genre ${genreName}:`, err);
                        }
                    }
                }
            }

            // Attach Directors to Movie
            if (formData.directors && formData.directors.length > 0) {
                for (const directorName of formData.directors) {
                    try {
                        await attachPersonToMovie(newMovieId, directorName, 1); // 1 = Director
                    } catch (err) {
                        console.error(`Failed to attach director ${directorName}:`, err);
                    }
                }
            }

            // Attach Actors (Starring) to Movie
            if (formData.starring && formData.starring.length > 0) {
                for (const actorName of formData.starring) {
                    try {
                        await attachPersonToMovie(newMovieId, actorName, 2); // 2 = Actor
                    } catch (err) {
                        console.error(`Failed to attach actor ${actorName}:`, err);
                    }
                }
            }

            const sessionPromises: Promise<any>[] = [];

            for (const sessionCard of sessions) {
                if (!sessionCard.hall) continue;

                const dates = getDatesInRange(sessionCard.dateFrom, sessionCard.dateTo);
                dates.forEach(date => {
                    const payload = prepareSessionPayload(sessionCard, date, newMovieId);

                    if (payload.prices.length > 0) {
                        sessionPromises.push(createSession(payload));
                    }
                });
            }
            if (sessionPromises.length > 0) {
                await Promise.all(sessionPromises);
            }

            navigate('/admin/movies');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create movie');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles["add-movie-page"]}>
            <div className={styles["add-movie-header"]}>
                <h2>Add New Movie</h2>
                <button onClick={() => navigate('/admin/movies')} className={styles["back-btn"]}>
                    Back to Movies
                </button>
            </div>

            {error && <div className={styles["error-message"]}>{error}</div>}

            <form onSubmit={handleSubmit} className="add-movie-form">
                <MovieAddForm formData={formData} setFormData={setFormData} />

                {/* Sessions Section */}
                <SessionManager
                    sessions={sessions}
                    halls={halls}
                    seatTypes={seatTypes}
                    loadingHalls={loadingHalls}
                    onAddSession={addSession}
                    onRemoveSession={removeSession}
                    onSessionChange={handleSessionChange}
                />

                {/* Submit */}
                <div className={styles["form-actions"]}>
                    <button type="submit" className={styles["submit-btn"]} disabled={saving}>
                        {saving ? 'Creating Movie...' : 'Create Movie'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/movies')}
                        className={styles["cancel-btn"]}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};
