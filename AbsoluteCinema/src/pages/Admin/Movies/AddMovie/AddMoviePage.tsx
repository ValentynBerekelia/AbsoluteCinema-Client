import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AddMoviePage.module.css';
import { MovieAddForm } from '../../../../components/MovieAddForm/MovieForm';
import { MovieFormData } from '../../../../types/CreateMovieRequest';
import {
    createMovie,
    attachPersonToMovie,
    getGenres,
    searchPersons,
    createPerson,
    createGenre,
    attachMediaToPerson,
    CreatePersonRequestPayload
} from '../../../../api/movies';
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
    hallId: string;
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
    const [personModalRole, setPersonModalRole] = useState<1 | 2>(1);
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
        poster: null,
        posterUrl: ''
    });

    const [sessions, setSessions] = useState<SessionFormData[]>([
        {
            id: '1',
            dateFrom: '',
            dateTo: '',
            time: '11:00',
            hallId: '',
            seatPrices: {},
            enabledTypes: {},
        }
    ]);

    useEffect(() => {
        const initPage = async () => {
            try {
                const [hallsData, allGenres, directors, actors] = await Promise.all([
                    getHalls(),
                    getGenres(),
                    searchPersons(undefined, 1, 100),
                    searchPersons(undefined, 2, 100)
                ]);

                setHalls(mapHallsListFromApi(hallsData));

                const genreList = Array.isArray(allGenres) ? allGenres : allGenres?.genres || [];
                setGenreOptions(genreList.map((g: any) => ({
                    id: g?.id ?? '',
                    name: g?.name ?? g
                })).filter((g: any) => g.name.trim().length > 0));

                setDirectorOptions(Array.isArray(directors) ? directors.map((p: any) => ({
                    id: p.personId || p.id,
                    name: p.fullName || p.name
                })) : []);

                setActorOptions(Array.isArray(actors) ? actors.map((p: any) => ({
                    id: p.personId || p.id,
                    name: p.fullName || p.name
                })) : []);

            } catch (err) {
                console.error('Initial load failed:', err);
            }
        };
        initPage();
    }, []);

    const loadHallDetails = useCallback(async (hallId: string, sessionId: string) => {
        try {
            setLoadingHalls(prev => ({ ...prev, [hallId]: true }));
            const data = await getHallById(hallId);
            const { seats, availableSeatTypes } = mapHallDetailsFromApi(data);

            setHalls(prev => prev.map(h => h.id === hallId ? { ...h, seats, availableSeatTypes } : h));

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
            console.error('Hall details error:', err);
        } finally {
            setLoadingHalls(prev => ({ ...prev, [hallId]: false }));
        }
    }, []);

    const handleSessionChange = useCallback((id: string, field: keyof SessionFormData, value: any) => {
        setSessions(prev => prev.map(session => session.id === id ? { ...session, [field]: value } : session));
        if (field === 'hallId' && value) loadHallDetails(value, id);
    }, [loadHallDetails]);

    const handleCreateGenre = async (genreName: string) => {
        setCreatingGenre(true);
        try {
            const response = await createGenre(genreName);
            const newGenre: Genre = {
                id: response?.id ?? response?.genreId ?? '',
                name: response?.name ?? response?.genreName ?? genreName
            };
            setGenreOptions(prev => [...prev, newGenre]);
            setFormData(prev => ({ ...prev, genres: [...prev.genres, newGenre] }));
            setShowGenreModal(false);
            showToast('success', 'Genre created');
        } catch (err) {
            showToast('error', 'Failed to create genre');
        } finally {
            setCreatingGenre(false);
        }
    };

    const handleCreatePerson = async (personData: PersonFormModalData) => {
        setCreatingPerson(true);
        try {
            const response = await createPerson(personData);
            const newId = response.personId || response.id;
            const newPerson = { id: newId, name: personData.fullName };

            if (personData.photoUrl && newId) await attachMediaToPerson(newId, personData.photoUrl);

            if (personData.role === 1) {
                setDirectorOptions(prev => [...prev, newPerson]);
                setFormData(prev => ({ ...prev, directors: [...prev.directors, newPerson.name] }));
            } else {
                setActorOptions(prev => [...prev, newPerson]);
                setFormData(prev => ({ ...prev, starring: [...prev.starring, newPerson.name] }));
            }
            setShowPersonModal(false);
            showToast('success', 'Person created');
        } catch (err) {
            showToast('error', 'Failed to create person');
        } finally {
            setCreatingPerson(false);
        }
    };

    const resolvePersonId = async (name: string, role: 1 | 2) => {
        const options = role === 1 ? directorOptions : actorOptions;
        const match = options.find(p => p.name === name);
        if (match) return match.id;

        const results = await searchPersons(name, role, 1);
        return results[0]?.personId || results[0]?.id || '';
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

            if (formData.poster) bodyFormData.append('poster', formData.poster);
            formData.genres.forEach(g => bodyFormData.append('Genres', g.name));

            const movieResult = await createMovie(bodyFormData);
            const newMovieId = movieResult.movieId?.id || movieResult.id || movieResult;

            const personPromises: Promise<any>[] = [];

            for (const name of formData.directors) {
                const id = await resolvePersonId(name, 1);
                if (id) personPromises.push(attachPersonToMovie(newMovieId, id, 1));
            }
            for (const name of formData.starring) {
                const id = await resolvePersonId(name, 2);
                if (id) personPromises.push(attachPersonToMovie(newMovieId, id, 2));
            }
            await Promise.allSettled(personPromises);

            const sessionPromises = sessions
                .filter(s => s.hallId && s.dateFrom)
                .flatMap(s => {
                    const dates = getDatesInRange(s.dateFrom, s.dateTo || s.dateFrom);
                    return dates.map(date => createSession(prepareSessionPayload(s, date, newMovieId)));
                });
            await Promise.all(sessionPromises);

            showToast('success', 'Movie created successfully!');
            navigate('/admin/movies');
        } catch (err: any) {
            showToast('error', err.message || 'Failed to create movie');
        } finally {
            setSaving(false);
        }
    };

    const getValidationErrors = () => {
        const errors: string[] = [];

        if (!formData.movieName.trim() || formData.movieName === 'Add Movie Title')
            errors.push("Movie name");
        if (!formData.description.trim())
            errors.push("Description");
        if (!formData.duration || formData.duration === '0')
            errors.push("Duration");
        if (!formData.language.trim())
            errors.push("Language");
        if (!formData.country.trim())
            errors.push("Country");
        if (formData.genres.length === 0)
            errors.push("At least one genre");

        return errors;
    };

    const validationErrors = getValidationErrors();
    const isFormInvalid = validationErrors.length > 0 || saving;

    return (
        <div className={styles["add-movie-page"]}>
            <div className={styles["add-movie-header"]}>
                <h2>Add New Movie</h2>
                <button onClick={() => navigate('/admin/movies')} className={styles["back-btn"]}>Back</button>
            </div>

            <form onSubmit={handleSubmit} className="add-movie-form">
                <MovieAddForm
                    formData={formData}
                    setFormData={setFormData}
                    genreOptions={genreOptions}
                    directorOptions={directorOptions}
                    actorOptions={actorOptions}
                    onAddDirector={() => { setPersonModalRole(1); setShowPersonModal(true); }}
                    onAddActor={() => { setPersonModalRole(2); setShowPersonModal(true); }}
                    onAddGenre={() => setShowGenreModal(true)}
                />

                <SessionManager
                    sessions={sessions}
                    halls={halls}
                    seatTypes={seatTypes}
                    loadingHalls={loadingHalls}
                    onAddSession={() => setSessions(prev => [...prev, { id: Date.now().toString(), dateFrom: '', dateTo: '', time: '11:00', hallId: '', seatPrices: {}, enabledTypes: {} }])}
                    onRemoveSession={(id) => sessions.length > 1 && setSessions(prev => prev.filter(s => s.id !== id))}
                    onSessionChange={handleSessionChange}
                />

                <div className={styles["form-actions-container"]}>
                    {validationErrors.length > 0 && (
                        <div className={styles["validation-message"]}>
                            <span>Please fill in the required fields.: </span>
                            <span className={styles["error-list"]}>
                                {validationErrors.join(", ")}
                            </span>
                        </div>
                    )}

                    <div className={styles["form-actions"]}>
                        <button
                            type="submit"
                            className={styles["submit-btn"]}
                            disabled={isFormInvalid}
                        >
                            {saving ? 'Creating...' : 'Create Movie'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/movies')}
                            className={styles["cancel-btn"]}
                        >
                            Cancel
                        </button>
                    </div>
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