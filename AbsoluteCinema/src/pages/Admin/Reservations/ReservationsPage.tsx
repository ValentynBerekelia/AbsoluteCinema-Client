import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMovies } from '@/api/movies';
import { getMovieSessions } from '@/api/sessions';
import { getHallById } from '@/api/halls';
import { createTicket, deleteTicket, getSessionTickets } from '@/api/tickets';
import { mapHallDetailsFromApi, Seat, SeatType } from '@/types/hall';
import { SortOrder } from '@/types/MoviesQueryParameters';
import { getDynamicSeatColor } from '@/utils/colorGenerator';
import styles from './ReservationsPage.module.css';
import { useAuth } from '@/context/AuthContext/AuthContext';
import { useToast } from '@/context/ToastContext/ToastContext';
import { convertIsoToDateTime } from '@/utils/dataTimeConverters';

interface SessionSummary {
    id: string;
    movieId: string;
    movieTitle: string;
    hallId: string;
    hallName: string;
    startDateTime: string;
    format: number;
}

interface TicketInfo {
    id: string;
    sessionId: string;
    seatId: string;
    userId?: string;
}

const formatSessionDate = (dateTime: string) => {
    if (!dateTime) return '';

    const date = new Date(dateTime);
    const { time } = convertIsoToDateTime(dateTime);

    const weekday = date.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
    const day = date.getUTCDate();
    const month = date.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });

    return `${weekday}, ${month} ${day}, ${time}`;
};


const normalizeTickets = (data: any): TicketInfo[] => {
    const ticketsArray = Array.isArray(data) ? data : data?.tickets ?? data?.data ?? [];
    return ticketsArray.map((t: any) => ({
        id: String(t.id?.id ?? t.id ?? t.ticketId ?? ''),
        sessionId: String(t.sessionId?.id ?? t.sessionId ?? t.session?.id?.id ?? ''),
        seatId: String(t.seat?.id?.id ?? t.seat?.id ?? t.seatId?.id?.id ?? t.seatId ?? ''),
        userId: String(t.userId?.id ?? t.userId ?? t.user?.id?.id ?? '')
    })).filter((t: TicketInfo) => t.id && t.seatId);
};

export const ReservationsPage = () => {
    const [searchParams] = useSearchParams();
    const sessionIdFromUrl = searchParams.get('sessionId');
    const { user } = useAuth();
    const { showToast } = useToast();

    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(sessionIdFromUrl);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [hallSeats, setHallSeats] = useState<Seat[]>([]);
    const [hallTypes, setHallTypes] = useState<SeatType[]>([]);
    const [tickets, setTickets] = useState<TicketInfo[]>([]);
    const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
    const [userIdInput, setUserIdInput] = useState('');
    const [commentInput, setCommentInput] = useState('');
    const [isAdminReservation, setIsAdminReservation] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                setLoadingSessions(true);
                const now = new Date();

                const moviesResponse = await getMovies({
                    pageNumber: 1,
                    pageSize: 100,
                    sortColumn: 'name',
                    sortOrder: SortOrder.Asc
                });
                const rawMovies = Array.isArray(moviesResponse) ? moviesResponse : moviesResponse?.movies ?? [];

                const sessionsPerMovie = await Promise.all(
                    rawMovies.map(async (movie: any) => {
                        const mId = movie.id?.id ?? movie.id;

                        const sessionsResponse = await getMovieSessions(mId);
                        const sArray = Array.isArray(sessionsResponse) ? sessionsResponse : sessionsResponse?.sessions ?? [];

                        return sArray
                            .map((s: any) => ({
                                id: String(s.id?.id ?? s.id ?? ''),
                                movieId: mId,
                                movieTitle: movie.name ?? movie.title,
                                hallId: String(s.hallId?.id ?? s.hallId ?? ''),
                                hallName: String(s.hallName ?? 'Hall'),
                                startDateTime: String(s.startDateTime ?? ''),
                                format: Number(s.format ?? 1)
                            }))
                            .filter((s: SessionSummary) => new Date(s.startDateTime) >= now);
                    })
                );

                const flattened = sessionsPerMovie.flat().filter((s: any) => s.id);

                flattened.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

                setSessions(flattened);

                if (sessionIdFromUrl && flattened.some((s: SessionSummary) => s.id === sessionIdFromUrl)) {
                    setSelectedSessionId(sessionIdFromUrl);
                } else if (flattened.length > 0 && !selectedSessionId) {
                    setSelectedSessionId(flattened[0].id);
                }
            } catch (err) {
                showToast('error', 'Failed to load sessions');
            } finally {
                setLoadingSessions(false);
            }
        };
        fetchSessions();
    }, []);

    const selectedSession = useMemo(() => sessions.find(s => s.id === selectedSessionId) || null, [sessions, selectedSessionId]);

    const refreshTickets = async (sessionId: string) => {
        try {
            const res = await getSessionTickets(sessionId);
            setTickets(normalizeTickets(res));
        } catch (err) {
            setTickets([]);
        }
    };

    useEffect(() => {
        const loadSessionDetails = async () => {
            if (!selectedSession) return;
            try {
                setLoadingDetails(true);
                setSelectedSeatId(null);
                const hallRes = await getHallById(selectedSession.hallId);
                const { seats, availableSeatTypes } = mapHallDetailsFromApi(hallRes);
                setHallSeats(seats);
                setHallTypes(availableSeatTypes);
                await refreshTickets(selectedSession.id);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingDetails(false);
            }
        };
        loadSessionDetails();
    }, [selectedSession]);

    const occupiedSeatIds = useMemo(() => tickets.map(t => t.seatId), [tickets]);

    const groupedByRow = useMemo(() => {
        const grouped = hallSeats.reduce((acc, seat) => {
            if (!acc[seat.row]) acc[seat.row] = [];
            acc[seat.row].push(seat);
            return acc;
        }, {} as Record<number, Seat[]>);

        return Object.keys(grouped).map(Number).sort((a, b) => a - b).map(row => ({
            rowNumber: row,
            seats: grouped[row].sort((a, b) => a.number - b.number)
        }));
    }, [hallSeats]);

    const selectedTicket = selectedSeatId ? tickets.find(t => t.seatId === selectedSeatId) || null : null;
    const selectedSeat = selectedSeatId ? hallSeats.find(s => s.seatId === selectedSeatId) || null : null;

    const handleCreateReservation = async () => {
        const finalUserId = isAdminReservation ? user?.userId : userIdInput.trim();

        if (!selectedSession || !selectedSeatId) return;

        if (!finalUserId) {
            showToast('error', isAdminReservation
                ? 'Could not find your Admin ID. Please re-login.'
                : 'User ID is required');
            return;
        }

        try {
            setActionLoading(true);
            await createTicket({
                sessionId: selectedSession.id,
                seatId: selectedSeatId,
                userId: finalUserId
            });

            showToast('success', 'Reservation created successfully');
            await refreshTickets(selectedSession.id);

            setUserIdInput('');
            setIsAdminReservation(false);
        } catch (err: any) {
            showToast('error', 'Failed to create reservation');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelReservation = async () => {
        if (!selectedTicket || !selectedSession) return;
        try {
            setActionLoading(true);
            await deleteTicket(selectedTicket.id);
            await refreshTickets(selectedSession.id);
            setSelectedSeatId(null);
        } catch (err) {
            console.error(err);
            showToast('error', `Failed to cancel reservation ${String(err)}`);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className={styles["reservations-page"]}>
            <div className={styles["sessions-panel"]}>
                <div className={styles["panel-header"]}>
                    <h2>Sessions</h2>
                    {loadingSessions && <span className={styles["status-text"]}>Loading...</span>}
                </div>
                <div className={styles["sessions-list"]}>
                    {sessions.map(session => (
                        <button
                            key={session.id}
                            className={`${styles['session-item']} ${session.id === selectedSessionId ? styles.active : ''}`}
                            onClick={() => setSelectedSessionId(session.id)}
                            type="button"
                        >
                            <div className={styles["session-title"]}>{session.movieTitle}</div>
                            <div className={styles["session-meta"]}>
                                <span>{session.hallName}</span>
                                <span>{formatSessionDate(session.startDateTime)}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles["details-panel"]}>
                {!selectedSession ? (
                    <div className={styles["status-text"]}>Select a session to view reservations</div>
                ) : (
                    <>
                        <div className={styles["details-header"]}>
                            <h2>{selectedSession.movieTitle}</h2>
                            <div className={styles["details-meta"]}>
                                <span>{selectedSession.hallName}</span>
                                <span>{formatSessionDate(selectedSession.startDateTime)}</span>
                            </div>
                        </div>

                        {loadingDetails ? (
                            <div className={styles["status-text"]}>Loading hall...</div>
                        ) : (
                            <div className={styles["details-content"]}>
                                <div className={styles["hall-wrapper"]}>
                                    <div className={styles["screen-label"]}>SCREEN</div>
                                    <div className={styles["hall-grid"]}>
                                        {groupedByRow.map(row => (
                                            <div key={row.rowNumber} className={styles["seat-row"]}>
                                                <span className={styles["row-label"]}>{row.rowNumber}</span>
                                                <div className={styles["seat-row-grid"]}>
                                                    {row.seats.map(seat => {
                                                        const isOccupied = occupiedSeatIds.includes(seat.seatId || '');
                                                        const isSelected = selectedSeatId === seat.seatId;
                                                        const seatType = hallTypes.find(t => t.id === seat.seatTypeId);
                                                        const seatColor = getDynamicSeatColor(seatType?.name || 'standard');
                                                        return (
                                                            <button
                                                                key={seat.seatId}
                                                                className={`${styles['seat-cell']} ${isOccupied ? styles.occupied : ''} ${isSelected ? styles.selected : ''}`}
                                                                style={{ backgroundColor: isOccupied ? '#f0f0f0' : seatColor, opacity: isOccupied ? 0.5 : 1 }}
                                                                onClick={() => setSelectedSeatId(seat.seatId || null)}
                                                                type="button"
                                                                title={`Row ${seat.row}, Seat ${seat.number}`}
                                                            >
                                                                {seat.number}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <span className={styles["row-label"]}>{row.rowNumber}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles["reservation-panel"]}>
                                    {!selectedSeatId ? (
                                        <div className={styles["status-text"]}>Select a seat to manage</div>
                                    ) : (
                                        <div className={styles["reservation-details"]}>
                                            <h3>Seat {selectedSeat?.row}-{selectedSeat?.number}</h3>
                                            {selectedTicket ? (
                                                <>
                                                    <div className={styles["detail-row"]}><span>Ticket ID:</span><span>{selectedTicket.id.slice(0, 8)}...</span></div>
                                                    <div className={styles["detail-row"]}><span>User ID:</span><span>{selectedTicket.userId?.slice(0, 8)}...</span></div>
                                                    <button className={`${styles['action-btn']} ${styles.danger}`} onClick={handleCancelReservation} disabled={actionLoading}>Cancel reservation</button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className={styles["checkbox-group"]}>
                                                        <input type="checkbox" id="admin-check" checked={isAdminReservation} onChange={(e) => setIsAdminReservation(e.target.checked)} />
                                                        <label htmlFor="admin-check">Admin Reservation</label>
                                                    </div>
                                                    {!isAdminReservation && (
                                                        <div className={styles["input-group"]}>
                                                            <label>User ID</label>
                                                            <input type="text" value={userIdInput} onChange={(e) => setUserIdInput(e.target.value)} placeholder="User UUID" />
                                                        </div>
                                                    )}
                                                    <div className={styles["input-group"]}>
                                                        <label>Comment</label>
                                                        <textarea value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="Notes..." />
                                                    </div>
                                                    <button
                                                        className={styles["action-btn"]}
                                                        onClick={handleCreateReservation}
                                                        disabled={actionLoading || (!isAdminReservation && !userIdInput.trim())}
                                                    >
                                                        {actionLoading ? 'Processing...' : 'Create reservation'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};