import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import  styles from './EditMoviePage.module.css';
import { MovieAddForm } from '../../../../components/MovieAddForm/MovieForm';
import { MovieFormData } from '../../../../types/CreateMovieRequest';
import { HallGrid } from '@/components/HallGrid/HallGrid';
import { TicketPriceManager } from '@/components/TicketPriceManager/TicketPriceManager';
import { getMovieById, updateMoviePartial, createAndAttachMedia, deleteMedia, MediaType } from '@/api/movies';
import { getMovieSessions, updateSessionPartial, createSession } from '@/api/sessions';
import { getHalls, getHallById } from '@/api/halls';
import { Hall, SeatType } from '@/types/hall';
import { MediaManager } from '@/components/MediaManager/MediaManager';
import { mapApiSessionToForm } from '@/types/Session';

interface SessionFormData {
    id: string;
    date: string;
    time: string;
    hall: string;
    seatPrices: Record<string, string>;
    enabledTypes: Record<string, boolean>;
}

interface MediaItem {
    id: string;
    url: string;
    type: MediaType;
}

// Helpers
const convertTimeSpanToMinutes = (timeSpan: string): string => {
    const match = timeSpan.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
    if (match) return String(parseInt(match[1]) * 60 + parseInt(match[2]));
    return timeSpan;
};

const calculateDurationSeconds = (durationString: string): number => {
    const timeMatch = durationString.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
    if (timeMatch) return parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]);
    const mins = parseInt(durationString.trim(), 10);
    return !isNaN(mins) ? mins * 60 : 0;
};

export const EditMoviePage = () => {
    const navigate = useNavigate();
    const { movieId } = useParams<{ movieId: string }>();
    const safeMovieId = movieId ?? '';

    // Data states
    const [halls, setHalls] = useState<Hall[]>([]);
    const [formData, setFormData] = useState<MovieFormData>({
        movieName: '', description: '', rate: 0, ageLimit: 0,
        duration: '', country: '', studio: '', language: '',
        genres: [], directors: [], starring: [], poster: null
    });
    const [sessions, setSessions] = useState<SessionFormData[]>([]);
    const [stills, setStills] = useState<MediaItem[]>([]);
    const [trailers, setTrailers] = useState<MediaItem[]>([]);
    const [banner, setBanner] = useState<MediaItem | null>(null);

    // UI states
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
    const [stillInput, setStillInput] = useState('');
    const [trailerInput, setTrailerInput] = useState('');
    const [loadingHalls, setLoadingHalls] = useState<Record<string, boolean>>({});

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

            setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, enabledTypes: defaultEnabled } : s));
        } catch (err) { console.error("Hall details failed", err); }
        finally { setLoadingHalls(prev => ({ ...prev, [hallId]: false })); }
    }, []);

    // 3. Load Movie & Sessions
    useEffect(() => {
        if (!safeMovieId) return;
        const loadInitialData = async () => {
            try {
                const movieData = await getMovieById(safeMovieId);
                setFormData({
                    movieName: movieData.title || '',
                    description: movieData.description || '',
                    rate: movieData.rate || 0,
                    ageLimit: movieData.ageLimit || 0,
                    duration: movieData.duration ? convertTimeSpanToMinutes(movieData.duration) : '',
                    country: movieData.country || '',
                    studio: movieData.studio || '',
                    language: movieData.language || '',
                    genres: movieData.genres || [],
                    directors: movieData.directors || [],
                    starring: movieData.starring || [],
                    poster: null,
                    posterUrl: movieData.posterUrl || movieData.posterImage?.url || ''
                });

                // Media mapping
                setStills(movieData.imageUrls?.map((url: string, i: number) => ({
                    id: movieData.imageIds?.[i] || `img-${i}`,
                    url, type: MediaType.Image
                })) || []);

                // 2. (Video - Type 4)
                if (movieData.trailerUrls && Array.isArray(movieData.trailerUrls)) {
                    setTrailers(movieData.trailerUrls.map((url: string, i: number) => ({
                        id: movieData.trailerIds?.[i] || `tr-${i}`,
                        url,
                        type: MediaType.Video
                    })));
                }

                // 3. (Banner - Type 5)
                if (movieData.bannerUrl) {
                    setBanner({
                        id: movieData.bannerId || 'bn-0',
                        url: movieData.bannerUrl,
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


            } catch (err) { setError("Failed to load movie data"); }
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
                durationSeconds: calculateDurationSeconds(formData.duration),
                name: formData.movieName
            };
            await updateMoviePartial(safeMovieId, payload);
            alert("Movie info updated!");
        } catch (err) { setError("Save failed"); }
        finally { setSaving(false); }
    };

    const handleSaveSession = async (sessionId: string) => {
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        const prices = Object.keys(session.enabledTypes)
            .filter(tid => session.enabledTypes[tid])
            .map(tid => ({ seatTypeId: tid, price: Number(session.seatPrices[tid] || 0) }));

        try {
            const isNew = sessionId.length < 15;
            if (isNew) {
                await createSession({
                    movieId: safeMovieId,
                    hallId: session.hall,
                    format: 1,
                    startTime: `${session.date}T${session.time}:00Z`,
                    prices
                });
            } else {
                await updateSessionPartial(sessionId, {
                    movieID: { id: safeMovieId },
                    hallId: { id: session.hall },
                    startDateTime: `${session.date}T${session.time}:00Z`
                });
            }
            alert("Session saved!");
        } catch (err) { setError("Session save failed"); }
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
                                {/* 1. Ряд управління (Дата, Час, Зал) */}
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

                                {/* 2. Візуалізація залу */}
                                <div className={styles["hall-grid-container"]}>
                                    <HallGrid seats={hall?.seats || []} seatTypes={hallTypes} enabledTypes={s.enabledTypes} />
                                </div>

                                {/* 3. Управління цінами */}
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
                                        onClick={() => {/* логіка видалення */ }}
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