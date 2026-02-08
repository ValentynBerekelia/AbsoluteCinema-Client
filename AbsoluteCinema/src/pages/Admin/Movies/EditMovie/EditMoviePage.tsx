import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './EditMoviePage.module.css';
import { MovieAddForm } from '../../../../components/MovieAddForm/MovieForm';
import { MovieFormData } from '../../../../types/CreateMovieRequest';
import { HallGrid } from '@/components/HallGrid/HallGrid';
import { TicketPriceManager } from '@/components/TicketPriceManager/TicketPriceManager';
import { getMovieById, updateMoviePartial, createAndAttachMedia, deleteMedia, MediaType, attachPersonToMovie, removePersonFromMovie, attachGenreToMovie, removeGenreFromMovie, getGenres, deleteMovie, searchPersons, createPerson, createGenre, attachMediaToPerson, CreatePersonRequestPayload } from '@/api/movies';
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

    // Data states
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
    const [personModalRole, setPersonModalRole] = useState<1 | 2>(1); // 1 = Director, 2 = Actor
    const [creatingPerson, setCreatingPerson] = useState(false);
    const [showGenreModal, setShowGenreModal] = useState(false);
    const [creatingGenre, setCreatingGenre] = useState(false);

    // UI states
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingHalls, setLoadingHalls] = useState<Record<string, boolean>>({});
    const [loadingMovie, setLoadingMovie] = useState(false);

    // 1. Load Halls List
    useEffect(() => {
        const fetchHalls = async () => {
            try {
                const data = await getHalls();
                const hallsArray = data?.halls || data;
                setHalls(hallsArray.map((h: any) => ({
                    id: h.id?.id || h.id,
                    name: h.name,
                    seats: []
                })));
            } catch (err) { console.error("Halls load failed", err); }
        };
        fetchHalls();
    }, []);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const allGenres = await getGenres();
                const genreList = Array.isArray(allGenres) ? allGenres : allGenres?.genres || [];
                const formattedGenres = genreList
                    .map((g: any) => ({
                        id: g?.id || '',
                        name: g?.name || g
                    }))
                    .filter((g: any) => g.name.trim().length > 0);
                setGenreOptions(formattedGenres);
            } catch (err) {
                console.error('Failed to fetch genres:', err);
            }
        };

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

        fetchGenres();
        fetchPersons();
    }, []);

    // 2. Load Hall Details (Seats & Types)
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

                    hallData.availableSeatTypes?.forEach((type: any) => {
                        const id = type.seatTypeId?.id ?? type.seatTypeId;
                        if (!newPrices[id]) newPrices[id] = "0";
                        if (newEnabled[id] === undefined) newEnabled[id] = true;
                    });

                    return { ...s, seatPrices: newPrices, enabledTypes: newEnabled };
                }
                return s;
            }));
        } catch (err) { console.error("Hall details failed", err); }
        finally { setLoadingHalls(prev => ({ ...prev, [hallId]: false })); }
    }, []);

    // 3. Load Movie & Sessions
    useEffect(() => {
        if (!safeMovieId) return;
        setLoadingMovie(true);
        const loadInitialData = async () => {
            try {
                const movieData = await getMovieById(safeMovieId);

                const directors = movieData.persons
                    ?.filter((p: any) => (p.personRole ?? p.role) === 1)
                    .map((p: any) => p.personName ?? p.fullName ?? p.name)
                    .filter(Boolean) || [];

                const starring = movieData.persons
                    ?.filter((p: any) => (p.personRole ?? p.role) === 2)
                    .map((p: any) => p.personName ?? p.fullName ?? p.name)
                    .filter(Boolean) || [];

                const genresArray: Genre[] = movieData.genres?.map((g: any) => ({
                    id: g.id ?? '',
                    name: g.name ?? g
                })) || [];

                const newFormData = {
                    movieName: movieData.title,
                    description: movieData.description,
                    rate: movieData.rate,
                    ageLimit: movieData.ageLimit,
                    duration: movieData.duration ? timeSpanToMinutes(String(movieData.duration)) : '',
                    country: movieData.country,
                    studio: movieData.studio,
                    language: movieData.language,
                    genres: genresArray,
                    directors: directors,
                    starring: starring,
                    poster: null,
                    posterUrl: movieData.poster?.url || ''
                };

                setFormData(newFormData);
                setOriginalFormData(newFormData);

                // Media mapping
                setStills(mapMediaToGallery(movieData.images, MediaType.Image));

                setTrailers(mapMediaToGallery(movieData.trailers, MediaType.Video));

                // 3. (Banner - Type 5)
                if (movieData.banner) {
                    setBanner({
                        id: movieData.banner.id,
                        url: movieData.banner.url,
                        type: MediaType.BannerImage
                    });
                }

                // Sessions mapping
                const sessionsData = await getMovieSessions(safeMovieId);
                const sessionsArray = sessionsData?.sessions || (Array.isArray(sessionsData) ? sessionsData : []);

                if (sessionsArray.length > 0) {
                    const mappedSessions = sessionsArray.map(mapApiSessionToForm);
                    setSessions(mappedSessions);

                    // Fetch details for already assigned halls
                    mappedSessions.forEach((s: any) => {
                        if (s.hall) loadHallDetails(s.hall, s.id);
                    });

                }


            } catch (err) {
                setError(String(err));
            } finally { setLoadingMovie(false); }
        };
        loadInitialData();
    }, [safeMovieId, loadHallDetails]);

    const handleSessionChange = (id: string, field: keyof SessionFormData, value: any) => {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
        if (field === 'hall' && value) loadHallDetails(value, id);
    };

    const handleSaveMovieDetailsOnly = async () => {
        setSaving(true);
        try {
            const payload = {
                ...formData,
                durationSeconds: minutesToSeconds(formData.duration),
                name: formData.movieName
            };
            await updateMoviePartial(safeMovieId, payload);

            // Handle Genres Changes
            const currentGenreIds = formData.genres.map(g => g.id);
            const originalGenreIds = originalFormData.genres.map(g => g.id);

            const removedGenres = originalFormData.genres.filter(g => !currentGenreIds.includes(g.id));
            const addedGenres = formData.genres.filter(g => !originalGenreIds.includes(g.id));

            for (const genre of removedGenres) {
                if (genre.id) {
                    try {
                        await removeGenreFromMovie(safeMovieId, genre.id);
                        console.log(`Successfully removed genre ID: ${genre.id}`);
                    } catch (err) {
                        console.error(`Failed to remove genre ${genre.name} (ID: ${genre.id}):`, err);
                    }
                }
            }

            for (const genre of addedGenres) {
                if (genre.id) {
                    try {
                        await attachGenreToMovie(safeMovieId, genre.id);
                    } catch (err) {
                        console.error(`Failed to attach genre ${genre.name}:`, err);
                    }
                } else {
                    console.warn(`Genre ${genre.name} has no ID and cannot be attached.`);
                }
            }

            // Fetch current persons to avoid duplicate attaches
            const currentMovieData = await getMovieById(safeMovieId);
            const currentPersons = currentMovieData.persons || [];

            const currentDirectorIds = new Set(
                currentPersons
                    .filter((p: any) => (p.personRole ?? p.role) === 1)
                    .map((p: any) => p.personId ?? p.id)
                    .filter(Boolean)
            );
            const currentActorIds = new Set(
                currentPersons
                    .filter((p: any) => (p.personRole ?? p.role) === 2)
                    .map((p: any) => p.personId ?? p.id)
                    .filter(Boolean)
            );
            const currentDirectorNames = new Set(
                currentPersons
                    .filter((p: any) => (p.personRole ?? p.role) === 1)
                    .map((p: any) => p.personName ?? p.fullName ?? p.name)
                    .filter(Boolean)
            );
            const currentActorNames = new Set(
                currentPersons
                    .filter((p: any) => (p.personRole ?? p.role) === 2)
                    .map((p: any) => p.personName ?? p.fullName ?? p.name)
                    .filter(Boolean)
            );

            // Handle Directors Changes
            const removedDirectors = originalFormData.directors.filter(d => !formData.directors.includes(d));
            const addedDirectors = Array.from(new Set(formData.directors.filter(d => !originalFormData.directors.includes(d))));

            for (const directorName of removedDirectors) {
                try {
                    // Get current persons and find director
                    const movieData = await getMovieById(safeMovieId);
                    const director = movieData.persons?.find((p: any) => (p.personName ?? p.fullName ?? p.name) === directorName && (p.personRole ?? p.role) === 1);
                    if (director) {
                        await removePersonFromMovie(safeMovieId, director.id ?? director.personId);
                    }
                } catch (err) {
                    console.error(`Failed to remove director ${directorName}:`, err);
                }
            }

            for (const directorName of addedDirectors) {
                try {
                    if (currentDirectorNames.has(directorName)) {
                        console.info(`Director ${directorName} already attached.`);
                        continue;
                    }
                    const personId = await resolvePersonId(directorName, 1);
                    if (!personId) {
                        console.warn(`Director ${directorName} has no ID and cannot be attached.`);
                        continue;
                    }
                    if (currentDirectorIds.has(personId)) {
                        console.info(`Director ${directorName} already attached.`);
                        continue;
                    }
                    await attachPersonToMovie(safeMovieId, personId, 1); // 1 = Director
                } catch (err) {
                    console.error(`Failed to attach director ${directorName}:`, err);
                }
            }

            // Handle Actors (Starring) Changes
            const removedActors = originalFormData.starring.filter(a => !formData.starring.includes(a));
            const addedActors = Array.from(new Set(formData.starring.filter(a => !originalFormData.starring.includes(a))));

            for (const actorName of removedActors) {
                try {
                    // Get current persons and find actor
                    const movieData = await getMovieById(safeMovieId);
                    const actor = movieData.persons?.find((p: any) => (p.personName ?? p.fullName ?? p.name) === actorName && (p.personRole ?? p.role) === 2);
                    if (actor) {
                        await removePersonFromMovie(safeMovieId, actor.id ?? actor.personId);
                    }
                } catch (err) {
                    console.error(`Failed to remove actor ${actorName}:`, err);
                }
            }

            for (const actorName of addedActors) {
                try {
                    if (currentActorNames.has(actorName)) {
                        console.info(`Actor ${actorName} already attached.`);
                        continue;
                    }
                    const personId = await resolvePersonId(actorName, 2);
                    if (!personId) {
                        console.warn(`Actor ${actorName} has no ID and cannot be attached.`);
                        continue;
                    }
                    if (currentActorIds.has(personId)) {
                        console.info(`Actor ${actorName} already attached.`);
                        continue;
                    }
                    await attachPersonToMovie(safeMovieId, personId, 2); // 2 = Actor
                } catch (err) {
                    console.error(`Failed to attach actor ${actorName}:`, err);
                }
            }

            // Update original data to match current state
            setOriginalFormData(formData);
            showToast('success', "Movie information updated successfully!");
        } catch (err) {
            setError("Save failed");
            showToast('error', "Failed to save movie information");
        }
        finally { setSaving(false); }
    };

    const handleOpenPersonModal = (role: 1 | 2) => {
        setPersonModalRole(role);
        setShowPersonModal(true);
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
        }
    };

    const handleDeleteMovie = async () => {
        if (!window.confirm(`Are you sure you want to delete "${formData.movieName}"? This action cannot be undone.`)) {
            return;
        }

        setSaving(true);
        try {
            await deleteMovie(safeMovieId);
            showToast('success', "Movie deleted successfully");
            navigate('/admin/movies');
        } catch (err) {
            console.error("Delete failed", err);
            showToast('error', "Failed to delete movie");
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
                    hallId: { id: session.hall },
                    startDateTime: `${session.date}T${session.time}:00Z`,
                    seatPrices
                });
            }
            showToast('success', "Session updated successfully!");
        } catch (err) {
            showToast('error', "Session save failed");
            setError("Session save failed");
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
        } catch (err) {
            console.error("Delete failed: ", err);
        }
    };


    return (
        <div className={styles["edit-movie-page"]}>
            <div className={styles["edit-movie-header"]}>
                <h2>Edit Movie</h2>
                <div className={styles["header-actions"]}>
                    <button
                        onClick={handleDeleteMovie}
                        className={styles['delete-btn']}
                        disabled={saving}
                        title="Delete Movie"
                    >
                        🗑 Delete Movie
                    </button>
                    <button onClick={() => navigate('/admin/movies')} className={styles['back-btn']}>← Back</button>
                </div>
            </div>
            <div className={styles["edit-movie-form"]}>
                <div className={styles["movie-details-section"]}>
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
                    <div className={styles["details-save-actions"]}>
                        <button
                            onClick={handleSaveMovieDetailsOnly}
                            className={styles["save-details-btn"]}
                            disabled={saving}
                        >
                            {saving ? '💾 Saving...' : '💾 Save Info Only'}
                        </button>
                    </div>
                </div>


                {/* Media Management */}
                <MediaManager
                    movieId={safeMovieId}
                    initialStills={stills}
                    initialTrailers={trailers ?? undefined}
                    initialBanner={banner ?? undefined}
                />

                {/* Sessions */}
                <div className={styles["sessions-section"]}>
                    <h3>Sessions</h3>
                    {sessions.map((s, idx) => {
                        const hall = halls.find(h => h.id === s.hall);
                        const hallTypes = hall?.availableSeatTypes ?? [];
                        return (
                            <div key={s.id} className={styles["session-card"]}>
                                <div className={styles["session-controls-row"]}>
                                    <input
                                        type="date"
                                        className={styles["form-input"]}
                                        value={s.date}
                                        onChange={e => handleSessionChange(s.id, 'date', e.target.value)}
                                    />
                                    <input
                                        type="time"
                                        className={styles["form-input"]}
                                        value={s.time}
                                        onChange={e => handleSessionChange(s.id, 'time', e.target.value)}
                                    />
                                    <select
                                        className={styles["form-input"]}
                                        value={s.hall}
                                        onChange={e => handleSessionChange(s.id, 'hall', e.target.value)}
                                    >
                                        <option value="">Select Hall</option>
                                        {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                    </select>
                                </div>

                                <div className={styles["hall-grid-container"]}>
                                    <HallGrid seats={hall?.seats || []} seatTypes={hallTypes} enabledTypes={s.enabledTypes} />
                                </div>

                                <div className={styles["ticket-prices-wrapper"]}>
                                    <h4 className={styles["prices-title"]}>Ticket Prices</h4>
                                    <TicketPriceManager
                                        sessionId={s.id}
                                        seatTypes={hallTypes}
                                        enabledTypes={s.enabledTypes}
                                        seatPrices={s.seatPrices}
                                        onPriceChange={(tid, field, val) => {
                                            const sub = field === 'enabled' ? 'enabledTypes' : 'seatPrices';
                                            handleSessionChange(s.id, sub, { ...s[sub], [tid]: val });
                                        }}
                                    />
                                </div>

                                <div className={styles["session-footer"]}>
                                    <button
                                        type="button"
                                        className={styles["remove-session-btn"]}
                                        onClick={() => handleDeleteSession(s.id)}
                                    >
                                        Remove Session
                                    </button>
                                    <button
                                        type="button"
                                        className="save-session-btn"
                                        onClick={() => handleSaveSession(s.id)}
                                    >
                                        Save Session Changes
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    <button
                        className={styles['add-session-btn']}
                        onClick={() =>
                            setSessions(p =>
                                [...p,
                                {
                                    id: Date.now().toString(),
                                    date: '',
                                    time: '',
                                    hall: '',
                                    seatPrices: {},
                                    enabledTypes: {}
                                }]
                            )
                        }>+ Add Session</button>
                </div>
            </div>

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