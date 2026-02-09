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
    hall: string;
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

    // 1. Loading genres, directors, actors
    useEffect(() => {
        const fetchReferenceData = async () => {
            try {
                const [hallsData, allGenres, directors, actors] = await Promise.all([
                    getHalls(),
                    getGenres(),
                    searchPersons(undefined, 1, 100),
                    searchPersons(undefined, 2, 100)
                ]);

                setHalls((hallsData?.halls || hallsData).map((h: any) => ({
                    id: h.id?.id || h.id,
                    name: h.name,
                    seats: []
                })));

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

    // 2. Loading hall details
    const loadHallDetails = useCallback(async (hallId: string, sessionId: string) => {
        setLoadingHalls(prev => ({ ...prev, [hallId]: true }));
        try {
            const hallData = await getHallById(hallId);
            const availableSeatTypes = hallData.availableSeatTypes?.map((t: any) => ({
                id: t.seatTypeId?.id || t.seatTypeId,
                name: t.name
            })) || [];

            setHalls(prev => prev.map(h => h.id === hallId ? {
                ...h,
                seats: hallData.seats.map((s: any) => ({ ...s, seatTypeId: s.seatTypeId?.id || s.seatTypeId })),
                availableSeatTypes
            } : h));

            setSessions(prev => prev.map(s => {
                if (s.id === sessionId) {
                    const newPrices = { ...s.seatPrices };
                    const newEnabled = { ...s.enabledTypes };
                    availableSeatTypes.forEach((type: any) => {
                        const id = type.id;
                        if (!newPrices[id]) newPrices[id] = "0";
                        if (newEnabled[id] === undefined) newEnabled[id] = true;
                    });
                    return { ...s, seatPrices: newPrices, enabledTypes: newEnabled };
                }
                return s;
            }));
        } catch (err) {
            console.error("Hall details failed", err);
        } finally {
            setLoadingHalls(prev => ({ ...prev, [hallId]: false }));
        }
    }, []);

    // 3. Load movie details
    useEffect(() => {
        if (!safeMovieId) return;
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

                const sessionsData = await getMovieSessions(safeMovieId);
                const sessionsArray = Array.isArray(sessionsData) ? sessionsData : sessionsData?.sessions || [];
                const mappedSessions = sessionsArray.map(mapApiSessionToForm);
                setSessions(mappedSessions);
                mappedSessions.forEach((s: any) => s.hall && loadHallDetails(s.hall, s.id));

            } catch (err) {
                showToast('error', "Failed to load movie data");
            } finally {
                setLoadingMovie(false);
            }
        };
        loadMovieData();
    }, [safeMovieId, loadHallDetails, showToast]);

    const resolvePersonId = async (name: string, role: 1 | 2) => {
        const options = role === 1 ? directorOptions : actorOptions;
        const match = options.find(p => p.name === name);
        if (match) return match.id;
        const results = await searchPersons(name, role, 1);
        return results[0]?.personId || results[0]?.id || '';
    };

    // Movie
    const handleSaveMovieDetailsOnly = async () => {
        setSaving(true);
        try {
            const payload = {
                ...formData,
                durationSeconds: minutesToSeconds(formData.duration),
                name: formData.movieName
            };
            await updateMoviePartial(safeMovieId, payload);

            // Poster
            if (formData.poster instanceof File) {
                const currentMovie = await getMovieById(safeMovieId);
                if (currentMovie.poster?.id) await deleteMedia(safeMovieId, currentMovie.poster.id);
                await createAndAttachMedia(safeMovieId, { type: MediaType.PosterImage, file: formData.poster });
                showToast('success', "Poster updated");
            }

            // Genres
            const removedGenres = originalFormData.genres.filter(og => !formData.genres.find(g => g.id === og.id));
            const addedGenres = formData.genres.filter(g => !originalFormData.genres.find(og => og.id === g.id));

            for (const g of removedGenres) await removeGenreFromMovie(safeMovieId, g.id);
            for (const g of addedGenres) await attachGenreToMovie(safeMovieId, g.id);
            if (addedGenres.length > 0 || removedGenres.length > 0) showToast('success', "Genres updated");

            // Persons
            const currentMovieData = await getMovieById(safeMovieId); // Refresh tracking
            const currentPersonIds = new Set(currentMovieData.persons?.map((p: any) => p.personId || p.id));

            for (const name of formData.directors) {
                const id = await resolvePersonId(name, 1);
                if (id && !currentPersonIds.has(id)) {
                    await attachPersonToMovie(safeMovieId, id, 1);
                    showToast('success', `Director ${name} attached`);
                }
            }
            for (const name of formData.starring) {
                const id = await resolvePersonId(name, 2);
                if (id && !currentPersonIds.has(id)) {
                    await attachPersonToMovie(safeMovieId, id, 2);
                    showToast('success', `Actor ${name} attached`);
                }
            }

            const allCurrentNames = [...formData.directors, ...formData.starring];
            const toRemove = currentMovieData.persons?.filter((p: any) => !allCurrentNames.includes(p.personName || p.fullName));
            for (const p of toRemove || []) {
                await removePersonFromMovie(safeMovieId, p.id || p.personId);
            }

            setOriginalFormData(formData);
            showToast('success', "All movie details saved successfully!");
        } catch (err) {
            showToast('error', "Some updates failed. Check console.");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // Sessions
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
                    hallId: { id: session.hall },
                    startDateTime: `${session.date}T${session.time}:00Z`,
                    seatPrices
                });
            }
            showToast('success', "Session updated successfully!");
        } catch (err) {
            showToast('error', "Session save failed");
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (!window.confirm("Are you sure you want to delete this session?")) return;

        try {
            const isRealSession = sessionId.length > 15;

            if (isRealSession) {
                await deleteSession(sessionId);
                console.log(`Session ${sessionId} deleted from DB`);
            }

            setSessions(prev => prev.filter(s => s.id !== sessionId));
            showToast('success', 'Session deleted successfully');
        } catch (err) {
            console.error("Delete failed: ", err);
        }
    };

    const handleSessionChange = (id: string, field: keyof SessionFormData, value: any) => {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
        if (field === 'hall' && value) loadHallDetails(value, id);
    };

    // Modals
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
            showToast('success', "New person created and added");
        } catch (err) { showToast('error', "Failed to create person"); }
        finally { setCreatingPerson(false); }
    };

    const handleCreateGenre = async (name: string) => {
        setCreatingGenre(true);
        try {
            const res = await createGenre(name);
            const newG = { id: res.id || res.genreId, name: res.name || name };
            setGenreOptions(p => [...p, newG]);
            setFormData(f => ({ ...f, genres: [...f.genres, newG] }));
            setShowGenreModal(false);
            showToast('success', "Genre created");
        } catch (err) { showToast('error', "Genre creation failed"); }
        finally { setCreatingGenre(false); }
    };

    if (loadingMovie) return <div className={styles.loading}>Loading movie details...</div>;

    return (
        <div className={styles["edit-movie-page"]}>
            <div className={styles["edit-movie-header"]}>
                <h2>Edit: {originalFormData.movieName}</h2>
                <div className={styles["header-actions"]}>
                    <button onClick={async () => {
                        if (window.confirm("Delete this movie?")) {
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

                <div className={styles["details-save-actions"]}>
                    <button onClick={handleSaveMovieDetailsOnly} className={styles["save-details-btn"]} disabled={saving}>
                        {saving ? '💾 Saving Changes...' : '💾 Save General Info'}
                    </button>
                </div>

                <MediaManager movieId={safeMovieId} initialStills={stills} initialTrailers={trailers} initialBanner={banner || undefined} />

                <div className={styles["sessions-section"]}>
                    <h3>Sessions Management</h3>
                    {sessions.map(s => (
                        <div key={s.id} className={styles["session-card"]}>
                            <div className={styles["session-controls-row"]}>
                                <input type="date" value={s.date} onChange={e => handleSessionChange(s.id, 'date', e.target.value)} className="form-input" />
                                <input type="time" value={s.time} onChange={e => handleSessionChange(s.id, 'time', e.target.value)} className="form-input" />
                                <select value={s.hall} onChange={e => handleSessionChange(s.id, 'hall', e.target.value)} className="form-input">
                                    <option value="">Select Hall</option>
                                    {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                </select>
                            </div>
                            <HallGrid seats={halls.find(h => h.id === s.hall)?.seats || []} seatTypes={halls.find(h => h.id === s.hall)?.availableSeatTypes || []} enabledTypes={s.enabledTypes} />
                            <TicketPriceManager
                                sessionId={s.id}
                                seatTypes={halls.find(h => h.id === s.hall)?.availableSeatTypes || []}
                                enabledTypes={s.enabledTypes}
                                seatPrices={s.seatPrices}
                                onPriceChange={(tid, field, val) => {
                                    const sub = field === 'enabled' ? 'enabledTypes' : 'seatPrices';
                                    handleSessionChange(s.id, sub, { ...s[sub], [tid]: val });
                                }}
                            />
                            <div className={styles["session-footer"]}>
                                <button onClick={() => handleDeleteSession(s.id)} className={styles["remove-session-btn"]}>Remove</button>
                                <button onClick={() => handleSaveSession(s.id)} className="save-session-btn">Save Session</button>
                            </div>
                        </div>
                    ))}
                    <button className={styles['add-session-btn']} onClick={() => setSessions(p => [...p, { id: Date.now().toString(), date: '', time: '12:00', hall: '', seatPrices: {}, enabledTypes: {} }])}>
                        + Add New Session
                    </button>
                </div>
            </div>

            {showPersonModal && <PersonFormModal onSubmit={handleCreatePerson} onCancel={() => setShowPersonModal(false)} isLoading={creatingPerson} />}
            {showGenreModal && <GenreForm onSubmit={handleCreateGenre} onCancel={() => setShowGenreModal(false)} isLoading={creatingGenre} />}
        </div>
    );
};