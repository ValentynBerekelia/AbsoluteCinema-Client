import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AddMoviePage.module.css';
import { MovieAddForm } from '../../../../components/MovieAddForm/MovieForm';
import { CreateMovieRequest, MovieFormData } from '../../../../types/CreateMovieRequest';
import { createMovie, attachPersonToMovie, attachGenreToMovie, getGenres, searchPersons, createPerson, createGenre, attachMediaToPerson, CreatePersonRequestPayload } from '../../../../api/movies';
import { SessionManager } from '@/components/SessionManager/SessionManager';
import { getDatesInRange } from '@/utils/getDatesInRange';
import { createSession, getHallById, getHalls } from '@/api';
import { Hall, mapHallDetailsFromApi, mapHallsListFromApi, SeatType } from '@/types/hall';
import { prepareSessionPayload } from '@/utils/prepareSessionPayload';
import { Genre } from '@/types/Genre';
import { minutesToTimeSpan } from '@/utils/dataTimeConverters';
import { useToast } from '@/context/ToastContext/ToastContext';
import { PersonFormModal, PersonFormData as PersonFormModalData } from '@/components/PersonFormModal/PersonFormModal';
import { GenreForm } from '@/components/GenreForm/GenreForm';

interface SessionFormData {
    id: string;
    dateFrom: string;
    dateTo: string;
    time: string;
    hall: string;
    seatPrices: Record<string, string>;
    enabledTypes: Record<string, boolean>;
}

interface PersonOption {
    id: string;
    name: string;
}

export const AddMoviePage = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [halls, setHalls] = useState<Hall[]>([]);
    const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
    const [loadingHalls, setLoadingHalls] = useState<Record<string, boolean>>({});
    const [saving, setSaving] = useState(false);
    const [genreOptions, setGenreOptions] = useState<Genre[]>([]);
    const [directorOptions, setDirectorOptions] = useState<PersonOption[]>([]);
    const [actorOptions, setActorOptions] = useState<PersonOption[]>([]);
    const [showPersonModal, setShowPersonModal] = useState(false);
    const [personModalRole, setPersonModalRole] = useState<1 | 2>(1); // 1 = Director, 2 = Actor
    const [creatingPerson, setCreatingPerson] = useState(false);
    const [showGenreModal, setShowGenreModal] = useState(false);
    const [creatingGenre, setCreatingGenre] = useState(false);

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

    const fetchGenres = useCallback(async () => {
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
    }, [showToast]);

    // Fetch genres and persons
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [hallsData, allGenres] = await Promise.all([getHalls(), getGenres()]);
                
                setHalls(mapHallsListFromApi(hallsData));

        const fetchPersons = async () => {
            try {
                const directors = await searchPersons(undefined, 1, 100); // 1 = Director
                const actors = await searchPersons(undefined, 2, 100); // 2 = Actor
                
                setDirectorOptions(Array.isArray(directors) ? directors.map((p: any) => ({
                    id: p.personId || p.id,
                    name: p.fullName || p.name
                })) : []);
                
                setActorOptions(Array.isArray(actors) ? actors.map((p: any) => ({
                    id: p.personId || p.id,
                    name: p.fullName || p.name
                })) : []);
            } catch (err) {
                console.error('Failed to fetch persons:', err);
                // Don't show error, persons are optional
            }
        };
        fetchData();
    }, [showToast]);

        fetchHalls();
        fetchGenres();
        fetchPersons();
    }, [fetchGenres, showToast]);

    const loadHallDetails = async (hallId: string, sessionId: string) => {
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

    const handleOpenPersonModal = (role: 1 | 2) => {
        setPersonModalRole(role);
        setShowPersonModal(true);
    };

    const handleCreateGenre = async (genreName: string) => {
        setCreatingGenre(true);
        try {
            const response = await createGenre(genreName);
            const newGenre: Genre = {
                id: response?.id ?? response?.genreId ?? '',
                name: response?.name ?? response?.genreName ?? genreName
            };
            setGenreOptions(prev => [...prev, newGenre]);
            setFormData(prev => ({
                ...prev,
                genres: [...(prev.genres || []), newGenre]
            }));
            setShowGenreModal(false);
            showToast('success', 'Genre created successfully');
        } catch (err) {
            console.error('Failed to create genre:', err);
            showToast('error', 'Failed to create genre');
        } finally {
            setCreatingGenre(false);
            fetchGenres();
        }
    };

    const handleCreatePerson = async (personData: PersonFormModalData) => {
        setCreatingPerson(true);
        try {
            const payload: CreatePersonRequestPayload = {
                fullName: personData.fullName,
                bio: personData.bio,
                birthDate: personData.birthDate,
                role: personData.role
            };

            const response = await createPerson(payload);
            const newPersonId = response.personId || response.id;
            const newPerson: PersonOption = {
                id: newPersonId,
                name: response.fullName || personData.fullName
            };

            if (personData.photoUrl && newPersonId) {
                try {
                    await attachMediaToPerson(newPersonId, personData.photoUrl);
                } catch (mediaErr) {
                    console.error('Failed to attach person media:', mediaErr);
                    showToast('error', 'Failed to attach person media');
                }
            }

            if (personData.role === 1) {
                setDirectorOptions(prev => [...prev, newPerson]);
                setFormData(prev => ({
                    ...prev,
                    directors: [...(prev.directors || []), newPerson.name]
                }));
            } else {
                setActorOptions(prev => [...prev, newPerson]);
                setFormData(prev => ({
                    ...prev,
                    starring: [...(prev.starring || []), newPerson.name]
                }));
            }

            setShowPersonModal(false);
            showToast('success', 'Person created successfully');
        } catch (err: any) {
            console.error('Failed to create person:', err);
            showToast('error', 'Failed to create person');
        } finally {
            setCreatingPerson(false);
        }
    };

    const resolvePersonId = async (name: string, role: 1 | 2) => {
        const options = role === 1 ? directorOptions : actorOptions;
        const directMatch = options.find(p => p.name === name);
        if (directMatch?.id) return directMatch.id;

        try {
            const results = await searchPersons(name, role, 5);
            if (Array.isArray(results)) {
                const match = results.find((p: any) => (p.fullName || p.name) === name);
                return match?.personId || match?.id || '';
            }
        } catch (err) {
            console.error('Failed to resolve person by name:', name, err);
        }
        return '';
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

            // Attach Directors to Movie
            if (formData.directors && formData.directors.length > 0) {
                for (const directorName of formData.directors) {
                    try {
                        const personId = await resolvePersonId(directorName, 1);
                        if (!personId) {
                            console.warn(`Director ${directorName} has no ID and cannot be attached.`);
                            continue;
                        }
                        await attachPersonToMovie(newMovieId, personId, 1); // 1 = Director
                    } catch (err) {
                        console.error(`Failed to attach director ${directorName}:`, err);
                    }
                }
            }

            // Attach Actors (Starring) to Movie
            if (formData.starring && formData.starring.length > 0) {
                for (const actorName of formData.starring) {
                    try {
                        const personId = await resolvePersonId(actorName, 2);
                        if (!personId) {
                            console.warn(`Actor ${actorName} has no ID and cannot be attached.`);
                            continue;
                        }
                        await attachPersonToMovie(newMovieId, personId, 2); // 2 = Actor
                    } catch (err) {
                        console.error(`Failed to attach actor ${actorName}:`, err);
                    }
                }
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
                    directorOptions={directorOptions}
                    actorOptions={actorOptions}
                    onAddDirector={() => handleOpenPersonModal(1)}
                    onAddActor={() => handleOpenPersonModal(2)}
                    onAddGenre={() => setShowGenreModal(true)}
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

            {showPersonModal && (
                <PersonFormModal
                    onSubmit={handleCreatePerson}
                    onCancel={() => setShowPersonModal(false)}
                    isLoading={creatingPerson}
                />
            )}

            {showGenreModal && (
                <GenreForm
                    onSubmit={handleCreateGenre}
                    onCancel={() => setShowGenreModal(false)}
                    isLoading={creatingGenre}
                />
            )}
        </div>
    );
};