import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './EditMoviePage.module.css';
import { MovieAddForm } from '../../../../components/MovieAddForm/MovieForm';
import { MovieFormData } from '../../../../types/CreateMovieRequest';
import { HallGrid } from '@/components/HallGrid/HallGrid';
import { TicketPriceManager } from '@/components/TicketPriceManager/TicketPriceManager';
import { getMovieById, updateMoviePartial, createAndAttachMedia, deleteMedia, MediaType, attachPersonToMovie, removePersonFromMovie, attachGenreToMovie, removeGenreFromMovie, getGenres } from '@/api/movies';
import { getMovieSessions, updateSessionPartial, createSession, deleteSession } from '@/api/sessions';
import { getHalls, getHallById } from '@/api/halls';
import { Hall, SeatType } from '@/types/hall';
import { MediaManager } from '@/components/MediaManager/MediaManager';
import { mapApiSessionToForm } from '@/types/Session';
import { mapMediaToGallery, Media } from '@/types/Media';
import { minutesToSeconds, timeSpanToMinutes } from '@/utils/dataTimeConverters';
import { prepareSessionPayload } from '@/utils/prepareSessionPayload';

interface SessionFormData {
    id: string;
    date: string;
    time: string;
    hall: string;
    seatPrices: Record<string, string>;
    enabledTypes: Record<string, boolean>;
}

export const EditMoviePage = () => {
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

    // UI states
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
    const [stillInput, setStillInput] = useState('');
    const [trailerInput, setTrailerInput] = useState('');
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

            // Auto-enable all types for new hall selection
            const defaultEnabled = availableSeatTypes.reduce((acc: any, t: any) => {
                acc[t.id] = true;
                return acc;
            }, {});

            setSessions(prev => prev.map(s => {
                if (s.id === sessionId) {
                    const newPrices = {...s.seatPrices};
                    const newEnabled = {...s.enabledTypes};

                    hallData.availableSeatTypes?.forEach((type: any) => {
                        const id = type.seatTypeId?.id ?? type.seatTypeId;
                        if (!newPrices[id]) newPrices[id] = "0";
                        if (newEnabled[id] === undefined) newEnabled[id] = true;
                    });

                    return {...s, seatPrices: newPrices, enabledTypes: newEnabled};
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
                    ?.filter((p: any) => p.personRole === 1)
                    .map((p: any) => p.personName) || [];

                const starring = movieData.persons
                    ?.filter((p: any) => p.personRole === 2)
                    .map((p: any) => p.personName) || [];

                const genresArray = movieData.genres?.map((g: any) => typeof g === 'object' ? g.name : g) || [];

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
            const allGenres = await getGenres();
            const genreList = Array.isArray(allGenres) ? allGenres : allGenres.genres || [];
            
            const removedGenres = originalFormData.genres.filter(g => !formData.genres.includes(g));
            const addedGenres = formData.genres.filter(g => !originalFormData.genres.includes(g));

            for (const genreName of removedGenres) {
                const genre = genreList.find((g: any) => g.name === genreName);
                if (genre) {
                    try {
                        await removeGenreFromMovie(safeMovieId, genre.id);
                    } catch (err) {
                        console.error(`Failed to remove genre ${genreName}:`, err);
                    }
                }
            }

            for (const genreName of addedGenres) {
                const genre = genreList.find((g: any) => g.name === genreName);
                if (genre) {
                    try {
                        await attachGenreToMovie(safeMovieId, genre.id);
                    } catch (err) {
                        console.error(`Failed to attach genre ${genreName}:`, err);
                    }
                }
            }

            // Handle Directors Changes
            const removedDirectors = originalFormData.directors.filter(d => !formData.directors.includes(d));
            const addedDirectors = formData.directors.filter(d => !originalFormData.directors.includes(d));

            for (const directorName of removedDirectors) {
                try {
                    // Get current persons and find director
                    const movieData = await getMovieById(safeMovieId);
                    const director = movieData.persons?.find((p: any) => p.personName === directorName && p.personRole === 1);
                    if (director) {
                        await removePersonFromMovie(safeMovieId, director.id);
                    }
                } catch (err) {
                    console.error(`Failed to remove director ${directorName}:`, err);
                }
            }

            for (const directorName of addedDirectors) {
                try {
                    await attachPersonToMovie(safeMovieId, directorName, 1); // 1 = Director
                } catch (err) {
                    console.error(`Failed to attach director ${directorName}:`, err);
                }
            }

            // Handle Actors (Starring) Changes
            const removedActors = originalFormData.starring.filter(a => !formData.starring.includes(a));
            const addedActors = formData.starring.filter(a => !originalFormData.starring.includes(a));

            for (const actorName of removedActors) {
                try {
                    // Get current persons and find actor
                    const movieData = await getMovieById(safeMovieId);
                    const actor = movieData.persons?.find((p: any) => p.personName === actorName && p.personRole === 2);
                    if (actor) {
                        await removePersonFromMovie(safeMovieId, actor.id);
                    }
                } catch (err) {
                    console.error(`Failed to remove actor ${actorName}:`, err);
                }
            }

            for (const actorName of addedActors) {
                try {
                    await attachPersonToMovie(safeMovieId, actorName, 2); // 2 = Actor
                } catch (err) {
                    console.error(`Failed to attach actor ${actorName}:`, err);
                }
            }

            // Update original data to match current state
            setOriginalFormData(formData);
            alert("Movie info updated!");
        } catch (err) { setError("Save failed"); }
        finally { setSaving(false); }
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
            alert("Session saved!");
        } catch (err) { setError("Session save failed"); }
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

    // Media Handlers
    const handleAddStill = async () => {
        if (!stillInput.trim()) return;
        try {
            await createAndAttachMedia(safeMovieId, { url: stillInput, type: MediaType.Image });
            setStills(p => [...p, { id: Date.now().toString(), url: stillInput, type: MediaType.Image }]);
            setStillInput('');
        } catch (err) { setError("Add still failed"); }
    };


    return (
        <div className={styles["edit-movie-page"]}>
            <div className={styles["edit-movie-header"]}>
                <h2>Edit Movie</h2>
                <button onClick={() => navigate('/admin/movies')} className={styles['back-btn']}>← Back</button>
            </div>

            {error && <div className={styles["error-message"]}>{error}</div>}

            <div className={styles["edit-movie-form"]}>
                <div className={styles["movie-details-section"]}>
                    <MovieAddForm formData={formData} setFormData={setFormData} />
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
        </div>
    );
};