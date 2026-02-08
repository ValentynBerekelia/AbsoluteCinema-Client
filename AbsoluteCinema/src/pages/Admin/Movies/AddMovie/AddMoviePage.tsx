import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AddMoviePage.module.css';
import { MovieAddForm } from '../../../../components/MovieAddForm/MovieForm';
import { MovieFormData } from '../../../../types/CreateMovieRequest';
import { createMovie, attachPersonToMovie, getGenres } from '../../../../api/movies';
import { SessionManager } from '@/components/SessionManager/SessionManager';
import { getDatesInRange } from '@/utils/getDatesInRange';
import { createSession, getHallById, getHalls } from '@/api';
import { Hall, mapHallDetailsFromApi, mapHallsListFromApi, SeatType } from '@/types/hall';
import { prepareSessionPayload } from '@/utils/prepareSessionPayload';
import { Genre } from '@/types/Genre';
import { minutesToTimeSpan } from '@/utils/dataTimeConverters';
import { useToast } from '@/context/ToastContext/ToastContext';

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
    const navigate = useNavigate();

    const [halls, setHalls] = useState<Hall[]>([]);
    const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
    const [loadingHalls, setLoadingHalls] = useState<Record<string, boolean>>({});
    const [saving, setSaving] = useState(false);
    const [genreOptions, setGenreOptions] = useState<Genre[]>([]);

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [hallsData, allGenres] = await Promise.all([getHalls(), getGenres()]);
                
                setHalls(mapHallsListFromApi(hallsData));

                const genreList = Array.isArray(allGenres) ? allGenres : allGenres?.genres || [];
                const formattedGenres = genreList
                    .map((g: any) => ({
                        id: g?.id ?? '',
                        name: g?.name ?? g
                    }))
                    .filter((g: any) => g.name.trim().length > 0);
                setGenreOptions(formattedGenres);
            } catch (err) {
                console.error('Initialization error:', err);
                showToast('error', 'Failed to load initial data');
            }
        };
        fetchData();
    }, [showToast]);

    const loadHallDetails = useCallback(async (hallId: string, sessionId: string) => {
        try {
            setLoadingHalls(prev => ({ ...prev, [hallId]: true }));
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
                    if (mergedPrices[type.id] === undefined) mergedPrices[type.id] = '';
                });
                return { ...session, enabledTypes: defaultEnabled, seatPrices: mergedPrices };
            }));
        } catch (err) {
            console.error('Failed to load hall details:', err);
            showToast('error', 'Failed to load hall details');
        } finally {
            setLoadingHalls(prev => ({ ...prev, [hallId]: false }));
        }
    }, [showToast]);

    const handleSessionChange = useCallback((id: string, field: keyof SessionFormData, value: any) => {
        setSessions(prev => prev.map(session =>
            session.id === id ? { ...session, [field]: value } : session
        ));

        if (field === 'hall' && value) {
            loadHallDetails(value, id);
        }
    }, [loadHallDetails]);

    const addSession = () => {
        setSessions(prev => [...prev, {
            id: Date.now().toString(),
            dateFrom: '',
            dateTo: '',
            time: '11:00',
            hall: '',
            seatPrices: {},
            enabledTypes: {},
        }]);
    };

    const removeSession = (id: string) => {
        if (sessions.length > 1) {
            setSessions(prev => prev.filter(session => session.id !== id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const bodyFormData = new FormData();
            bodyFormData.append('MovieName', formData.movieName);
            bodyFormData.append('Description', formData.description);
            bodyFormData.append('Rate', formData.rate.toString());
            bodyFormData.append('AgeLimit', formData.ageLimit.toString());
            bodyFormData.append('Duration', minutesToTimeSpan(Number(formData.duration)));
            bodyFormData.append('Country', formData.country);
            bodyFormData.append('Studio', formData.studio);
            bodyFormData.append('Language', formData.language);

            if (formData.poster) {
                bodyFormData.append('poster', formData.poster);
            }

            if (formData.genres && formData.genres.length > 0) {
                formData.genres.forEach(genre => {
                    bodyFormData.append('Genres', genre.name);
                });
            }

            const movieResult = await createMovie(bodyFormData);
            const newMovieId = movieResult.movieId?.id || movieResult.id || movieResult;

            const personPromises: Promise<any>[] = [];
            
            if (formData.directors?.length) {
                formData.directors.forEach(name => 
                    personPromises.push(attachPersonToMovie(newMovieId, name, 1))
                );
            }
            if (formData.starring?.length) {
                formData.starring.forEach(name => 
                    personPromises.push(attachPersonToMovie(newMovieId, name, 2))
                );
            }
            
            if (personPromises.length > 0) {
                await Promise.allSettled(personPromises);
            }

            const sessionPromises: Promise<any>[] = [];
            for (const sessionCard of sessions) {
                if (!sessionCard.hall || !sessionCard.dateFrom) continue;

                const dates = getDatesInRange(sessionCard.dateFrom, sessionCard.dateTo || sessionCard.dateFrom);
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

            showToast('success', 'Movie and sessions created successfully!');
            navigate('/admin/movies');

        } catch (err: any) {
            console.error(err);
            const message = err.response?.data?.message || err.message || 'Failed to create movie';
            showToast('error', message);
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

            <form onSubmit={handleSubmit} className="add-movie-form">
                <MovieAddForm
                    formData={formData}
                    setFormData={setFormData}
                    genreOptions={genreOptions}
                />

                <SessionManager
                    sessions={sessions}
                    halls={halls}
                    seatTypes={seatTypes}
                    loadingHalls={loadingHalls}
                    onAddSession={addSession}
                    onRemoveSession={removeSession}
                    onSessionChange={handleSessionChange}
                />

                <div className={styles["form-actions"]}>
                    <button type="submit" className={styles["submit-btn"]} disabled={saving}>
                        {saving ? 'Creating...' : 'Create Movie'}
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