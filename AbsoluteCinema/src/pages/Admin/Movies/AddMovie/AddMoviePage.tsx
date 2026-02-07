import { useCallback, useEffect, useState } from 'react';
import { data, useNavigate } from 'react-router-dom';
import styles from './AddMoviePage.module.css';
import { MovieAddForm } from '../../../../components/MovieAddForm/MovieForm';
import { CreateMovieRequest, MovieFormData } from '../../../../types/CreateMovieRequest';
import { createMovie, attachPersonToMovie, attachGenreToMovie, getGenres, createGenre, createAndAttachPersonToMovie, CreatePersonRequestPayload } from '../../../../api/movies';
import { SessionManager } from '@/components/SessionManager/SessionManager';
import { getDatesInRange } from '@/utils/getDatesInRange';
import { createSession, getHallById, getHalls } from '@/api';
import { Hall, mapHallDetailsFromApi, mapHallsListFromApi, SeatType } from '@/types/hall';
import { prepareSessionPayload } from '@/utils/prepareSessionPayload';
import { Genre } from '@/types/Genre';
import { minutesToTimeSpan } from '@/utils/dataTimeConverters';
import { useToast } from '@/context/ToastContext/ToastContext';
import { GenreForm } from '@/components/GenreForm/GenreForm';
import { PersonForm, PersonRole } from '@/components/PersonForm/PersonForm';

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
    const { showToast } = useToast();

    const [halls, setHalls] = useState<Hall[]>([]);
    const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
    const [loadingHalls, setLoadingHalls] = useState<Record<string, boolean>>({});
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [genreOptions, setGenreOptions] = useState<Genre[]>([]);

    // Modal states
    const [showGenreForm, setShowGenreForm] = useState(false);
    const [showDirectorForm, setShowDirectorForm] = useState(false);
    const [showActorForm, setShowActorForm] = useState(false);
    const [creatingGenre, setCreatingGenre] = useState(false);
    const [creatingPerson, setCreatingPerson] = useState(false);

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
        poster: null as File | null,
        posterUrl: ''
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
                showToast('error', 'Failed to load halls');
            }
        };

        const fetchGenres = async () => {
            try {
                const allGenres = await getGenres();
                const genreList = Array.isArray(allGenres) ? allGenres : allGenres?.genres || [];
                const formattedGenres = genreList
                    .map((g: any) => ({
                        id: g?.id ?? '',
                        name: g?.name ?? g
                    }))
                    .filter((g: any) => g.name.trim().length > 0);
                setGenreOptions(formattedGenres);
            } catch (err) {
                console.error('Failed to fetch genres:', err);
                showToast('error', 'Failed to fetch genres');

            }
        };

        fetchHalls();
        fetchGenres();
    }, []);

    const loadHallDetails = async (hallId: string, sessionId: string) => {
        setLoadingHalls(prev => ({ ...prev, [hallId]: true }));
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
                availableSeatTypes.forEach((type: SeatType) => {
                    if (mergedPrices[type.id] === undefined) {
                        mergedPrices[type.id] = '';
                    }
                });
                return { ...session, enabledTypes: defaultEnabled, seatPrices: mergedPrices };
            }));

        } catch (err) {
            console.error('Failed to load hall details:', err);
            showToast('error', 'Failed to load hall details');
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
    }, []);

    // Handle genre creation
    const handleCreateGenre = async (genreName: string) => {
        setCreatingGenre(true);
        try {
            await createGenre(genreName);
            // Refresh genres list
            const allGenres = await getGenres();
            const genreList = Array.isArray(allGenres) ? allGenres : allGenres?.genres || [];
            const formattedGenres = genreList
                .map((g: any) => ({
                    id: g?.id ?? '',
                    name: g?.name ?? g
                }))
                .filter((g: any) => g.name.trim().length > 0);
            setGenreOptions(formattedGenres);
            
            // Auto-select the new genre
            setFormData(prev => ({
                ...prev,
                genres: [...prev.genres, { id: '', name: genreName }]
            }));
            
            setShowGenreForm(false);
            showToast('success', `Genre "${genreName}" created successfully!`);
        } catch (err: any) {
            showToast('error', `Failed to create genre: ${err.message || err.response?.data?.message}`);
        } finally {
            setCreatingGenre(false);
        }
    };

    // Handle person creation (Director)
    const handleCreateDirector = async (personData: CreatePersonRequestPayload) => {
        setCreatingPerson(true);
        try {
            // For now, just add to local list since we need a movie ID to attach
            setFormData(prev => ({
                ...prev,
                directors: [...prev.directors, personData.fullName]
            }));
            setShowDirectorForm(false);
            showToast('success', `Director "${personData.fullName}" will be added!`);
        } catch (err: any) {
            showToast('error', `Failed to add director: ${err.message}`);
        } finally {
            setCreatingPerson(false);
        }
    };

    // Handle person creation (Actor)
    const handleCreateActor = async (personData: CreatePersonRequestPayload) => {
        setCreatingPerson(true);
        try {
            // For now, just add to local list since we need a movie ID to attach
            setFormData(prev => ({
                ...prev,
                starring: [...prev.starring, personData.fullName]
            }));
            setShowActorForm(false);
            showToast('success', `Actor "${personData.fullName}" will be added!`);
        } catch (err: any) {
            showToast('error', `Failed to add actor: ${err.message}`);
        } finally {
            setCreatingPerson(false);
        }
    };

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
                duration: minutesToTimeSpan(Number(formData.duration)),
                country: formData.country,
                studio: formData.studio,
                language: formData.language,
                genres: []
            };

            const movieResult = await createMovie(moviePayload as any);
            const newMovieId = movieResult.movieId?.id ?? movieResult.id;

            // Attach Genres to Movie
            if (formData.genres && formData.genres.length > 0) {
                const allGenres = await getGenres();
                const genreList = Array.isArray(allGenres) ? allGenres : allGenres.genres || [];

                for (const genre of formData.genres) {
                    const genreName = typeof genre === 'string' ? genre : genre.name;
                    const genreObj = genreList.find((g: any) => g.name === genreName);
                    if (genreObj) {
                        try {
                            await attachGenreToMovie(newMovieId, genreObj.id);
                        } catch (err) {
                            console.error(`Failed to attach genre ${genreObj.name}:`, err);
                            showToast('error', `Failed to attach genre ${genreObj.name}`);
                        }
                    }
                }
            }

            // Create and Attach Directors to Movie
            if (formData.directors && formData.directors.length > 0) {
                for (const directorName of formData.directors) {
                    try {
                        // Create director with API
                        const personData: CreatePersonRequestPayload = {
                            fullName: directorName,
                            bio: '',
                            birthDate: new Date('1990-01-01').toISOString(),
                            role: 1 // Director role
                        };
                        await createAndAttachPersonToMovie(newMovieId, personData);
                    } catch (err) {
                        console.error(`Failed to create/attach director ${directorName}:`, err);
                    }
                }
            }

            // Create and Attach Actors (Starring) to Movie
            if (formData.starring && formData.starring.length > 0) {
                for (const actorName of formData.starring) {
                    try {
                        // Create actor with API
                        const personData: CreatePersonRequestPayload = {
                            fullName: actorName,
                            bio: '',
                            birthDate: new Date('1990-01-01').toISOString(),
                            role: 2 // Actor role
                        };
                        await createAndAttachPersonToMovie(newMovieId, personData);
                    } catch (err) {
                        console.error(`Failed to create/attach actor ${actorName}:`, err);
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
            showToast('error', err.message || 'Failed to create movie');
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
                <MovieAddForm
                    formData={formData}
                    setFormData={setFormData}
                    genreOptions={genreOptions}
                    onAddGenre={() => setShowGenreForm(true)}
                    onAddDirector={() => setShowDirectorForm(true)}
                    onAddActor={() => setShowActorForm(true)}
                />

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

            {/* Genre Form Modal */}
            {showGenreForm && (
                <GenreForm
                    onSubmit={handleCreateGenre}
                    onCancel={() => setShowGenreForm(false)}
                    isLoading={creatingGenre}
                />
            )}

            {/* Director Form Modal */}
            {showDirectorForm && (
                <PersonForm
                    role={PersonRole.Director}
                    onSubmit={handleCreateDirector}
                    onCancel={() => setShowDirectorForm(false)}
                    isLoading={creatingPerson}
                />
            )}

            {/* Actor Form Modal */}
            {showActorForm && (
                <PersonForm
                    role={PersonRole.Actor}
                    onSubmit={handleCreateActor}
                    onCancel={() => setShowActorForm(false)}
                    isLoading={creatingPerson}
                />
            )}
        </div>
    );
};
