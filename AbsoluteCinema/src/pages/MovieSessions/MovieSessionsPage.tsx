import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMovieById } from '../../api/movies';
import { getHallById } from '../../api/halls';
import { getMovieSessions } from '@/api/sessions';
import { mapHallDetailsFromApi } from '@/types/hall';
import { mapMovieDetailsFromApi } from '@/types/Movie';
import { MovieDetails } from '@/types/Movie';
import { Session } from '@/types/Session';
import './MovieSessionsPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const getDatesInRange = (startDate: Date, daysCount: number = 7): Date[] => {
    const dates = [];
    for (let i = 0; i < daysCount; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        dates.push(date);
    }
    return dates;
};

const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        weekday: 'short'
    });
};

const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

const resolveHallName = (apiSession: any): string | undefined => {
    return (
        apiSession.hallName ||
        apiSession.hall?.name ||
        apiSession.hall?.hallName ||
        apiSession.hall?.title ||
        apiSession.hallId?.name ||
        apiSession.hallId?.hallName
    );
};

const resolveHallId = (apiSession: any): string | undefined => {
    return apiSession.hallId?.id || apiSession.hallId || apiSession.hall?.id;
};

const resolveSeatPrices = (
    apiSession: any,
    seatTypes?: Array<{ id: string; name: string }>
): Array<{ seatTypeId: string; seatTypeName?: string; price?: number | null }> => {
    const rawPrices = apiSession.prices ?? apiSession.seatPrices ?? apiSession.priceList;
    const priceMap: Record<string, number> = {};
    const nameMap: Record<string, string> = {};

    if (Array.isArray(rawPrices)) {
        rawPrices.forEach((p: any) => {
            const seatTypeId =
                p?.seatTypeId?.id ??
                p?.seatTypeId ??
                p?.seatType?.id ??
                p?.typeId ??
                p?.id;
            const price = Number(p?.price ?? p?.amount ?? p?.value ?? p);
            const seatTypeName = p?.seatTypeName ?? p?.seatType?.name;
            if (seatTypeId && !Number.isNaN(price)) {
                priceMap[String(seatTypeId)] = price;
                if (seatTypeName) nameMap[String(seatTypeId)] = String(seatTypeName);
            }
        });
    } else if (rawPrices && typeof rawPrices === 'object') {
        Object.entries(rawPrices).forEach(([seatTypeId, value]) => {
            const price = Number(value);
            if (!Number.isNaN(price)) {
                priceMap[String(seatTypeId)] = price;
            }
        });
    }

    if (Array.isArray(seatTypes) && seatTypes.length > 0) {
        return seatTypes.map((st) => ({
            seatTypeId: String(st.id),
            seatTypeName: st.name,
            price: priceMap[String(st.id)] ?? null
        }));
    }

    return Object.entries(priceMap).map(([seatTypeId, price]) => ({
        seatTypeId,
        seatTypeName: nameMap[seatTypeId],
        price
    }));
};

const resolveBasePrice = (apiSession: any): number => {
    if (typeof apiSession.basePrice === 'number') return apiSession.basePrice;
    if (typeof apiSession.price === 'number') return apiSession.price;

    const rawPrices = apiSession.prices ?? apiSession.seatPrices;
    if (Array.isArray(rawPrices)) {
        const values = rawPrices
            .map((p: any) => Number(p?.price ?? p?.amount ?? p))
            .filter((v: number) => !Number.isNaN(v));
        return values.length ? Math.min(...values) : 0;
    }

    if (rawPrices && typeof rawPrices === 'object') {
        const values = Object.values(rawPrices)
            .map((v: any) => Number(v))
            .filter((v: number) => !Number.isNaN(v));
        return values.length ? Math.min(...values) : 0;
    }

    return 0;
};

// Map API session to our Session interface
const mapApiSessionToSession = (
    apiSession: any,
    seatTypes?: Array<{ id: string; name: string }>
): Session => {
    const rawDate = apiSession.date || apiSession.startDateTime || apiSession.startTime || '';
    const derivedTime = apiSession.time || (rawDate ? formatTime(rawDate) : '');
    const sessionId =
        apiSession.id?.id ??
        apiSession.id ??
        apiSession.sessionId?.id ??
        apiSession.sessionId;

    return {
        id: String(sessionId ?? ''),
        date: rawDate,
        time: derivedTime,
        hallName: resolveHallName(apiSession),
        basePrice: resolveBasePrice(apiSession),
        seatPrices: resolveSeatPrices(apiSession, seatTypes),
        movieType: apiSession.movieType
    };
};

export const MovieSessionsPage = () => {
    const params = useParams();
    const id = params.id;
    const navigate = useNavigate();
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [allSessions, setAllSessions] = useState<Session[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateOffset, setDateOffset] = useState(0);

    const dates = getDatesInRange(new Date(), 7);
    const visibleDates = dates.slice(dateOffset, dateOffset + 4);

    useEffect(() => {
        if (!id || id === 'undefined') {
            setError('Movie ID is required');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);

                const [movieResult, sessionsResult] = await Promise.allSettled([
                    getMovieById(id),
                    getMovieSessions(id)
                ]);

                if (movieResult.status === 'fulfilled') {
                    const mappedMovie = await mapMovieDetailsFromApi(movieResult.value);
                    setMovie(mappedMovie);
                } else {
                    setMovie({
                        id,
                        title: 'Movie',
                        description: '',
                        rate: 0,
                        duration: 0,
                        ageLimit: 0,
                        country: '',
                        studio: '',
                        language: '',
                        directors: [],
                        starring: [],
                        posterUrl: '',
                        bannerUrl: '',
                        stills: [],
                        trailers: [],
                        genres: []
                    });
                }

                if (sessionsResult.status !== 'fulfilled') {
                    throw sessionsResult.reason ?? new Error('Failed to fetch sessions');
                }

                const sessionsResponse = sessionsResult.value;
                const sessionsList = Array.isArray(sessionsResponse)
                    ? sessionsResponse
                    : sessionsResponse?.sessions ?? [];

                const hallCache = new Map<string, { hallName?: string; seatTypes?: Array<{ id: string; name: string }> }>();

                const enrichedSessions = await Promise.all(
                    sessionsList.map(async (session: any) => {
                        const hallId = resolveHallId(session);
                        let hallName: string | undefined;
                        let seatTypes: Array<{ id: string; name: string }> | undefined;

                        if (hallId) {
                            if (hallCache.has(hallId)) {
                                const cached = hallCache.get(hallId);
                                hallName = cached?.hallName;
                                seatTypes = cached?.seatTypes;
                            } else {
                                try {
                                    const hall = await getHallById(hallId);
                                    hallName = hall?.name || hall?.hallName || hall?.hall?.name;
                                    const mappedHall = mapHallDetailsFromApi(hall);
                                    seatTypes = mappedHall?.availableSeatTypes;
                                    hallCache.set(hallId, { hallName, seatTypes });
                                } catch {
                                    hallCache.set(hallId, { hallName: undefined, seatTypes: undefined });
                                }
                            }
                        }

                        const mapped = mapApiSessionToSession(session, seatTypes);
                        return hallName && !mapped.hallName ? { ...mapped, hallName } : mapped;
                    })
                );

                setAllSessions(enrichedSessions);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Update filtered sessions when selected date changes
    useEffect(() => {
        const selectedDateStr = formatDateForApi(selectedDate);
        const filtered = allSessions.filter(session => {
            const sessionDate = session.date?.split('T')[0];
            return sessionDate === selectedDateStr;
        });
        
        // Sort by time
        filtered.sort((a, b) => {
            const timeA = new Date(a.date || '').getTime();
            const timeB = new Date(b.date || '').getTime();
            return timeA - timeB;
        });
        
        setFilteredSessions(filtered);
    }, [selectedDate, allSessions]);

    const handleDateSelect = (date: Date) => {
        setSelectedDate(new Date(date));
    };

    const handleSessionClick = (session: Session) => {
        if (session.id && id) {
            navigate(`/booking/${id}/${session.id}`);
        }
    };

    if (loading) {
        return <div className="sessions-page-loading">Loading...</div>;
    }

    if (error) {
        return <div className="sessions-page-error">Error: {error}</div>;
    }

    if (!movie) {
        return <div className="sessions-page-error">Movie not found</div>;
    }

    return (
        <div className="movie-sessions-page">
            <div className="sessions-header">
                <h1>{movie.title}</h1>
                <p>Оберіть дату та час сеансу</p>
            </div>

            <div className="sessions-container">
                {/* Date Selector */}
                <div className="date-selector-wrapper">
                    <button
                        className="date-nav-btn"
                        onClick={() => setDateOffset(Math.max(0, dateOffset - 1))}
                        disabled={dateOffset === 0}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>

                    <div className="dates-grid">
                        {visibleDates.map((date) => (
                            <button
                                key={formatDateForApi(date)}
                                className={`date-button ${
                                    formatDateForApi(date) === formatDateForApi(selectedDate) ? 'active' : ''
                                }`}
                                onClick={() => handleDateSelect(date)}
                            >
                                <div className="date-day">{formatDateForDisplay(date)}</div>
                                <div className="date-num">{date.getDate()}</div>
                            </button>
                        ))}
                    </div>

                    <button
                        className="date-nav-btn"
                        onClick={() => setDateOffset(Math.min(dates.length - 4, dateOffset + 1))}
                        disabled={dateOffset >= dates.length - 4}
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>

                {/* Sessions List */}
                <div className="sessions-list-wrapper">
                    {filteredSessions.length > 0 ? (
                        <div className="sessions-list">
                            {filteredSessions.map((session) => (
                                <button
                                    key={session.id}
                                    className="session-item"
                                    onClick={() => handleSessionClick(session)}
                                >
                                    <div className="session-time">
                                        {formatTime(session.date || '')}
                                    </div>
                                    <div className="session-details">
                                        <span className="session-hall">
                                            Зал: {session.hallName || '—'}
                                        </span>
                                        <div className="session-prices">
                                            {session.seatPrices && session.seatPrices.length > 0 ? (
                                                session.seatPrices.map((price) => (
                                                    <div className="session-price-row" key={price.seatTypeId}>
                                                        <span className="session-price-label">
                                                            {price.seatTypeName || `Тип ${price.seatTypeId}`}
                                                        </span>
                                                        <span className="session-price-value">
                                                            {price.price != null ? `${price.price}₴` : '—'}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="session-price-empty">Немає даних по типах</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="session-action">
                                        Забронювати →
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="no-sessions">
                            Немає сеансів на обрану дату
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
