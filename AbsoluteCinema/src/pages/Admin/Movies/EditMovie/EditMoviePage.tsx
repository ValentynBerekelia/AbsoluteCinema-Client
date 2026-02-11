import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './EditMoviePage.module.css';
import { MovieAddForm } from '../../../../components/MovieAddForm/MovieForm';
import { MovieFormData } from '../../../../types/CreateMovieRequest';
import { HallGrid } from '@/components/HallGrid/HallGrid';
import { TicketPriceManager } from '@/components/TicketPriceManager/TicketPriceManager';
import {
    getMovieById, updateMoviePartial, createAndAttachMedia, deleteMedia,
    MediaType, attachPersonToMovie, removePersonFromMovie, attachGenreToMovie,
    removeGenreFromMovie, getGenres, deleteMovie, searchPersons, createPerson,
    createGenre, attachMediaToPerson, CreatePersonRequestPayload
} from '@/api/movies';
import { getMovieSessions, updateSessionPartial, createSession, deleteSession } from '@/api/sessions';
import { getHalls, getHallById } from '@/api/halls';
import { Hall, SeatType } from '@/types/hall';
import { MediaManager } from '@/components/MediaManager/MediaManager';
import { mapApiSessionToForm } from '@/types/Session';
import { mapMediaToGallery, Media } from '@/types/Media';
import { minutesToSeconds, timeSpanToMinutes } from '@/utils/dataTimeConverters';
import { prepareSessionPayload } from '@/utils/prepareSessionPayload';
import { Genre } from '@/types/Genre';
import { useToast } from '@/context/ToastContext/ToastContext';
import { PersonFormModal, PersonFormData as PersonFormModalData } from '@/components/PersonFormModal/PersonFormModal';
import { GenreForm } from '@/components/GenreForm/GenreForm';

interface SessionFormData {
    id: string;
    date: string;
    time: string;
    hallId: string;
    seatPrices: Record<string, string>;
    enabledTypes: Record<string, boolean>;
}

interface PersonOption {
    id: string;
    name: string;
}

export const EditMoviePage = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { movieId } = useParams<{ movieId: string }>();
    const safeMovieId = movieId ?? '';

    const [halls, setHalls] = useState<Hall[]>([]);
    const [formData, setFormData] = useState<MovieFormData>({
        movieName: '', description: '', rate: 0, ageLimit: 0,
        duration: '', country: '', studio: '', language: '',
        genres: [], directors: [], starring: [], poster: null, posterUrl: ''
    });
    const [originalFormData, setOriginalFormData] = useState<MovieFormData>({
        movieName: '', description: '', rate: 0, ageLimit: 0,
        duration: '', country: '', studio: '', language: '',
        genres: [], directors: [], starring: [], poster: null, posterUrl: ''
    });
    const [sessions, setSessions] = useState<SessionFormData[]>([]);
    const [stills, setStills] = useState<Media[]>([]);
    const [trailers, setTrailers] = useState<Media[]>([]);
    const [banner, setBanner] = useState<Media | null>(null);
    const [genreOptions, setGenreOptions] = useState<Genre[]>([]);
    const [directorOptions, setDirectorOptions] = useState<PersonOption[]>([]);
    const [actorOptions, setActorOptions] = useState<PersonOption[]>([]);

    const [showPersonModal, setShowPersonModal] = useState(false);
    const [personModalRole, setPersonModalRole] = useState<1 | 2>(1);
    const [creatingPerson, setCreatingPerson] = useState(false);
    const [showGenreModal, setShowGenreModal] = useState(false);
    const [creatingGenre, setCreatingGenre] = useState(false);

    const [saving, setSaving] = useState(false);
    const [loadingMovie, setLoadingMovie] = useState(false);
    const [loadingHalls, setLoadingHalls] = useState<Record<string, boolean>>({});

    // 1. Loading reference data (halls, genres, people)
    useEffect(() => {
        const fetchReferenceData = async () => {
            try {
                const [hallsData, allGenres, directors, actors] = await Promise.all([
                    getHalls(),
                    getGenres(),
                    searchPersons(undefined, 1, 100),
                    searchPersons(undefined, 2, 100)
                ]);

                setHalls((hallsData?.halls || hallsData).map((h: any) => {
                    const rawId = h.id?.id || h.id;
                    return {
                        id: String(rawId),
                        name: h.name,
                        seats: []
                    };
                }));

                setGenreOptions((Array.isArray(allGenres) ? allGenres : allGenres?.genres || [])
                    .map((g: any) => ({ id: g?.id || '', name: g?.name || g }))
                    .filter((g: any) => g.name.trim().length > 0));

                setDirectorOptions(Array.isArray(directors) ? directors.map((p: any) => ({
                    id: p.personId || p.id,
                    name: p.fullName || p.name
                })) : []);

                setActorOptions(Array.isArray(actors) ? actors.map((p: any) => ({
                    id: p.personId || p.id,
                    name: p.fullName || p.name
                })) : []);

            } catch (err) {
                console.error("Failed to load reference data", err);
            }
        };
        fetchReferenceData();
    }, []);

    // 2. Function to load seats for a specific hall
    const loadHallDetails = useCallback(async (hallId: string, sessionId: string) => {
        if (!hallId) return;
        const targetHallId = String(hallId);
        setLoadingHalls(prev => ({ ...prev, [targetHallId]: true }));
        try {
            const hallData = await getHallById(targetHallId);

            const availableSeatTypes = hallData.availableSeatTypes?.map((t: any) => ({
                id: String(t.seatTypeId?.id || t.seatTypeId),
                name: t.name
            })) || [];

            setHalls(prev => prev.map(h => h.id === targetHallId ? {
                ...h,
                seats: hallData.seats.map((s: any) => ({
                    ...s,
                    seatTypeId: String(s.seatTypeId?.id || s.seatTypeId)
                })),
                availableSeatTypes
            } : h));

            setSessions(prev => prev.map(s => {
                if (s.id === sessionId) {
                    const newPrices = { ...s.seatPrices };
                    const newEnabled = { ...s.enabledTypes };

                    availableSeatTypes.forEach((type: any) => {
                        const tid = type.id;
                        if (!newPrices[tid]) newPrices[tid] = "0";
                        if (newEnabled[tid] === undefined) newEnabled[tid] = true;
                    });

                    return { ...s, seatPrices: newPrices, enabledTypes: newEnabled, hallId: targetHallId };
                }
                return s;
            }));
        } catch (err) {
            console.error("Hall details failed", err);
        } finally {
            setLoadingHalls(prev => ({ ...prev, [targetHallId]: false }));
        }
    }, []);

    // 3. Load movie and its sessions
    useEffect(() => {
        if (!safeMovieId || halls.length === 0) return;

        const loadMovieData = async () => {
            setLoadingMovie(true);
            try {
                const movieData = await getMovieById(safeMovieId);
                const mappedDirectors = movieData.persons?.filter((p: any) => (p.personRole ?? p.role) === 1).map((p: any) => p.personName ?? p.fullName) || [];
                const mappedActors = movieData.persons?.filter((p: any) => (p.personRole ?? p.role) === 2).map((p: any) => p.personName ?? p.fullName) || [];

                const initialFormData = {
                    movieName: movieData.title,
                    description: movieData.description,
                    rate: movieData.rate,
                    ageLimit: movieData.ageLimit,
                    duration: movieData.duration ? timeSpanToMinutes(String(movieData.duration)) : '',
                    country: movieData.country,
                    studio: movieData.studio,
                    language: movieData.language,
                    genres: movieData.genres?.map((g: any) => ({ id: g.id, name: g.name })) || [],
                    directors: mappedDirectors,
                    starring: mappedActors,
                    poster: null,
                    posterUrl: movieData.poster?.url || ''
                };

                setFormData(initialFormData);
                setOriginalFormData(initialFormData);
                setStills(mapMediaToGallery(movieData.images, MediaType.Image));
                setTrailers(mapMediaToGallery(movieData.trailers, MediaType.Video));
                if (movieData.banner) setBanner({ id: movieData.banner.id, url: movieData.banner.url, type: MediaType.BannerImage });

                // Sessions
                const sessionsData = await getMovieSessions(safeMovieId);
                const sessionsArray = Array.isArray(sessionsData) ? sessionsData : sessionsData?.sessions || [];
                const mappedSessions = sessionsArray.map(mapApiSessionToForm);

                setSessions(mappedSessions);

                mappedSessions.forEach((s: any) => {
                    if (s.hallId) {
                        loadHallDetails(s.hallId, s.id);
                    }
                });

            } catch (err) {
                showToast('error', "Failed to load movie data");
            } finally {
                setLoadingMovie(false);
            }
        };
        loadMovieData();
    }, [safeMovieId, halls.length > 0]);

    const resolvePersonId = async (name: string, role: 1 | 2) => {
        const options = role === 1 ? directorOptions : actorOptions;
        const match = options.find(p => p.name === name);
        if (match) return match.id;
        const results = await searchPersons(name, role, 1);
        return results[0]?.personId || results[0]?.id || '';
    };

    // Save Logic
    const handleSaveMovieDetailsOnly = async () => {
        setSaving(true);
        try {
            const payload = {
                ...formData,
                durationSeconds: minutesToSeconds(formData.duration),
                name: formData.movieName
            };
            await updateMoviePartial(safeMovieId, payload);

            if (formData.poster instanceof File) {
                const currentMovie = await getMovieById(safeMovieId);
                if (currentMovie.poster?.id) await deleteMedia(safeMovieId, currentMovie.poster.id);
                await createAndAttachMedia(safeMovieId, { type: MediaType.PosterImage, file: formData.poster });
                showToast('success', "Poster updated");
            }

            const removedGenres = originalFormData.genres.filter(og => !formData.genres.find(g => g.id === og.id));
            const addedGenres = formData.genres.filter(g => !originalFormData.genres.find(og => og.id === g.id));
            for (const g of removedGenres) await removeGenreFromMovie(safeMovieId, g.id);
            for (const g of addedGenres) await attachGenreToMovie(safeMovieId, g.id);

            const currentMovieData = await getMovieById(safeMovieId);
            const currentPersonIds = new Set(currentMovieData.persons?.map((p: any) => p.personId || p.id));

            for (const name of formData.directors) {
                const id = await resolvePersonId(name, 1);
                if (id && !currentPersonIds.has(id)) await attachPersonToMovie(safeMovieId, id, 1);
            }
            for (const name of formData.starring) {
                const id = await resolvePersonId(name, 2);
                if (id && !currentPersonIds.has(id)) await attachPersonToMovie(safeMovieId, id, 2);
            }

            setOriginalFormData(formData);
            showToast('success', "Saved successfully!");
        } catch (err) {
            showToast('error', "Update failed");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSession = async (sessionId: string) => {
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;
        const payload = prepareSessionPayload(session, session.date, safeMovieId);

        const prices = Object.keys(session.enabledTypes)
            .filter(tid => session.enabledTypes[tid])
            .map(tid => ({ seatTypeId: tid, price: Number(session.seatPrices[tid] || 0) }));

        const seatPrices = prices.reduce((acc: Record<string, number>, p) => {
            acc[p.seatTypeId] = p.price;
            return acc;
        }, {} as Record<string, number>);

        try {
            const isNew = sessionId.length < 15;
            if (isNew) {
                await createSession(payload);
            } else {
                await updateSessionPartial(sessionId, {
                    movieID: { id: safeMovieId },
                    hallId: { id: session.hallId },
                    startDateTime: `${session.date}T${session.time}:00Z`,
                    seatPrices
                });
            }
            showToast('success', "Session updated!");
        } catch (err) {
            showToast('error', "Session save failed");
        }
    };

    const handleSessionChange = (id: string, field: keyof SessionFormData, value: any) => {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
        if (field === 'hallId' && value) loadHallDetails(value, id);
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (!window.confirm("Delete this session?")) return;
        try {
            if (sessionId.length > 15) await deleteSession(sessionId);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            showToast('success', 'Session removed');
        } catch (err) { console.error(err); }
    };

    const handleCreatePerson = async (personData: PersonFormModalData) => {
        setCreatingPerson(true);
        try {
            const res = await createPerson(personData);
            const newId = res.personId || res.id;
            if (personData.photoUrl && newId) await attachMediaToPerson(newId, personData.photoUrl);
            const newOpt = { id: newId, name: personData.fullName };
            if (personData.role === 1) {
                setDirectorOptions(p => [...p, newOpt]);
                setFormData(f => ({ ...f, directors: [...f.directors, newOpt.name] }));
            } else {
                setActorOptions(p => [...p, newOpt]);
                setFormData(f => ({ ...f, starring: [...f.starring, newOpt.name] }));
            }
            setShowPersonModal(false);
        } finally { setCreatingPerson(false); }
    };

    const handleCreateGenre = async (name: string) => {
        setCreatingGenre(true);
        try {
            const res = await createGenre(name);
            const newG = { id: res.id || res.genreId, name: res.name || name };
            setGenreOptions(p => [...p, newG]);
            setFormData(f => ({ ...f, genres: [...f.genres, newG] }));
            setShowGenreModal(false);
        } finally { setCreatingGenre(false); }
    };

    if (loadingMovie) return <div className={styles.loading}>Loading...</div>;

    const getMovieValidationErrors = () => {
        const errors: string[] = [];
        if (!formData.movieName.trim()) errors.push("Movie name");
        if (!formData.description.trim()) errors.push("Description");
        if (!formData.duration || formData.duration === '0') errors.push("Duration");
        if (!formData.language.trim()) errors.push("Language");
        if (!formData.country.trim()) errors.push("Country");
        if (formData.genres.length === 0) errors.push("Genres");
        return errors;
    };

    const movieErrors = getMovieValidationErrors();
    const isMovieInvalid = movieErrors.length > 0 || saving;

    const getSessionValidationErrors = (session: SessionFormData) => {
        const errors: string[] = [];
        const selectedHall = halls.find(h => String(h.id) === String(session.hallId));

        if (!session.date) errors.push("Data");
        if (!session.time) errors.push("Time");
        if (!session.hallId) errors.push("Hall");

        const hallSeatTypes = selectedHall?.availableSeatTypes ?? [];
        if (hallSeatTypes.length === 0 && session.hallId) {
            errors.push("Loading seat types...");
        }

        const hasUnfilledPrices = hallSeatTypes.some(type => {
            const isEnabled = session.enabledTypes[type.id];
            if (!isEnabled) return false;
            const price = session.seatPrices[type.id];
            return !price || String(price).trim() === '' || parseFloat(String(price)) <= 0;
        });

        if (hasUnfilledPrices) errors.push("Prices");
        return errors;
    };

    return (
        <div className={styles["edit-movie-page"]}>
            <div className={styles["edit-movie-header"]}>
                <h2>Edit: {originalFormData.movieName}</h2>
                <div className={styles["header-actions"]}>
                    <button onClick={async () => {
                        if (window.confirm("Delete movie?")) {
                            await deleteMovie(safeMovieId);
                            navigate('/admin/movies');
                        }
                    }} className={styles['delete-btn']}>🗑 Delete</button>
                    <button onClick={() => navigate('/admin/movies')} className={styles['back-btn']}>← Back</button>
                </div>
            </div>

            <div className={styles["edit-movie-form"]}>
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

                <div className={styles["details-save-actions-container"]}>
                    {movieErrors.length > 0 && (
                        <div className={styles["validation-info"]}>
                            Please fill in the required fields: <strong>{movieErrors.join(", ")}</strong>
                        </div>
                    )}
                    <div className={styles["details-save-actions"]}>
                        <button
                            onClick={handleSaveMovieDetailsOnly}
                            className={styles["save-details-btn"]}
                            disabled={isMovieInvalid}
                        >
                            {saving ? '💾 Saving...' : '💾 Save General Info'}
                        </button>
                    </div>
                </div>

                <MediaManager movieId={safeMovieId} initialStills={stills} initialTrailers={trailers} initialBanner={banner || undefined} />

                <div className={styles["sessions-section"]}>
                    <h3>Sessions Management</h3>
                    {sessions.map(s => {
                        const sessionErrors = getSessionValidationErrors(s);
                        const isSessionInvalid = sessionErrors.length > 0;
                        return (
                            <div key={s.id} className={styles["session-card"]}>
                                <div className={styles["session-controls-row"]}>
                                    <input type="date" value={s.date} onChange={e => handleSessionChange(s.id, 'date', e.target.value)} className="form-input" />
                                    <input type="time" value={s.time} onChange={e => handleSessionChange(s.id, 'time', e.target.value)} className="form-input" />
                                    <select value={s.hallId} onChange={e => handleSessionChange(s.id, 'hallId', e.target.value)} className="form-input">
                                        <option value="">Select Hall</option>
                                        {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                    </select>
                                </div>

                                <HallGrid
                                    seats={halls.find(h => h.id === s.hallId)?.seats || []}
                                    seatTypes={halls.find(h => h.id === s.hallId)?.availableSeatTypes || []}
                                    enabledTypes={s.enabledTypes}
                                />

                                <TicketPriceManager
                                    sessionId={s.id}
                                    seatTypes={halls.find(h => h.id === s.hallId)?.availableSeatTypes || []}
                                    enabledTypes={s.enabledTypes}
                                    seatPrices={s.seatPrices}
                                    onPriceChange={(tid, field, val) => {
                                        const sub = field === 'enabled' ? 'enabledTypes' : 'seatPrices';
                                        handleSessionChange(s.id, sub, { ...s[sub], [tid]: val });
                                    }}
                                />
                                <div className={styles["session-footer"]}>
                                    {isSessionInvalid && (
                                        <div className={styles["session-error-hint"]}>
                                            Need: {sessionErrors.join(", ")}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleDeleteSession(s.id)}
                                        className={styles["remove-session-btn"]}
                                    >
                                        Remove
                                    </button>
                                    <button
                                        onClick={() => handleSaveSession(s.id)}
                                        className={styles["save-session-btn"]}
                                        disabled={isSessionInvalid}
                                    >
                                        Save Session
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                    <button className={styles['add-session-btn']} onClick={() => setSessions(p => [...p, { id: Date.now().toString(), date: '', time: '12:00', hallId: '', seatPrices: {}, enabledTypes: {} }])}>
                        + Add New Session
                    </button>
                </div>
            </div>

            {showPersonModal && <PersonFormModal onSubmit={handleCreatePerson} onCancel={() => setShowPersonModal(false)} isLoading={creatingPerson} />}
            {showGenreModal && <GenreForm onSubmit={handleCreateGenre} onCancel={() => setShowGenreModal(false)} isLoading={creatingGenre} />}
        </div>
    );
};