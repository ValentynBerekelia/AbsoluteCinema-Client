import { useEffect, useMemo, useState } from 'react';
import { getMovies } from '@/api/movies';
import { getMovieSessions } from '@/api/sessions';
import { getHallById } from '@/api/halls';
import { createTicket, deleteTicket, getSessionTickets } from '@/api/tickets';
import { mapHallDetailsFromApi, Seat, SeatType } from '@/types/hall';
import { SortOrder } from '@/types/MoviesQueryParameters';
import { getDynamicSeatColor } from '@/utils/colorGenerator';
import styles from './ReservationsPage.module.css';

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
    return date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const normalizeTickets = (data: any): TicketInfo[] => {
    const ticketsArray = Array.isArray(data) ? data : data?.tickets ?? data?.data ?? [];

    const normalized = ticketsArray.map((t: any) => {
        // The API returns deeply nested: seat.id.id
        let seatId = '';

        // Try: seat.id.id (the actual nested structure)
        if (t.seat?.id?.id) {
            seatId = String(t.seat.id.id);
        }
        // Fallback: seat.id if it's a string
        else if (typeof t.seat?.id === 'string') {
            seatId = String(t.seat.id);
        }
        // Fallback: seatId field
        else if (t.seatId?.id?.id) {
            seatId = String(t.seatId.id.id);
        }
        else if (t.seatId) {
            seatId = typeof t.seatId === 'string' ? t.seatId : String(t.seatId?.id ?? '');
        }

        const ticket = {
            id: String(t.id?.id ?? t.id ?? t.ticketId ?? ''),
            sessionId: String(t.sessionId?.id ?? t.sessionId ?? t.session?.id?.id ?? ''),
            seatId: seatId,
            userId: String(t.userId?.id ?? t.userId ?? t.user?.id?.id ?? '')
        };

        console.log(`✓ Ticket - SeatID: ${seatId}`);
        return ticket;
    }).filter((t: TicketInfo) => t.id && t.seatId);

    console.log('✓ Tickets loaded:', normalized.length, '| SeatIDs:', normalized.map((t: TicketInfo) => t.seatId).join(', '));
    return normalized;
};

const ADMIN_USER_ID = '61981f2a-81ac-4afd-a87c-1ed52239d7ca';

export const ReservationsPage = () => {
    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [hallSeats, setHallSeats] = useState<Seat[]>([]);
    const [hallTypes, setHallTypes] = useState<SeatType[]>([]);
    const [tickets, setTickets] = useState<TicketInfo[]>([]);
    const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
    const [userIdInput, setUserIdInput] = useState('');
    const [commentInput, setCommentInput] = useState('');
    const [isAdminReservation, setIsAdminReservation] = useState(false);
    const [reservationNotes, setReservationNotes] = useState<Record<string, string>>({});
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                setLoadingSessions(true);
                setError(null);

                const moviesResponse = await getMovies({
                    pageNumber: 1,
                    pageSize: 100,
                    sortColumn: 'name',
                    sortOrder: SortOrder.Asc
                });

                const rawMovies = Array.isArray(moviesResponse)
                    ? moviesResponse
                    : moviesResponse?.movies ?? [];

                const moviesList = rawMovies.map((m: any) => ({
                    id: String(m.id?.id ?? m.id ?? m.movieId?.id ?? m.movieId ?? ''),
                    title: String(m.name ?? m.title ?? '')
                })).filter((m: any) => m.id);

                const sessionsPerMovie = await Promise.all(
                    moviesList.map(async (movie: any) => {
                        const sessionsResponse = await getMovieSessions(movie.id);
                        const sessionsArray = Array.isArray(sessionsResponse)
                            ? sessionsResponse
                            : sessionsResponse?.sessions ?? [];

                        return sessionsArray.map((s: any) => ({
                            id: String(s.id?.id ?? s.id ?? s.sessionId ?? ''),
                            movieId: movie.id,
                            movieTitle: movie.title,
                            hallId: String(s.hallId?.id ?? s.hallId ?? s.hall?.id ?? ''),
                            hallName: String(s.hallName ?? s.hall?.name ?? 'Hall'),
                            startDateTime: String(s.startDateTime ?? s.startTime ?? ''),
                            format: Number(s.format ?? s.movieType ?? 1)
                        }));
                    })
                );

                const flattenedSessions = sessionsPerMovie.flat()
                    .filter(s => s.id)
                    .filter(s => {
                        const sessionTime = new Date(s.startDateTime).getTime();
                        const now = new Date().getTime();
                        // Only show current and future sessions
                        return sessionTime >= now;
                    });
                flattenedSessions.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

                setSessions(flattenedSessions);

                if (flattenedSessions.length > 0) {
                    setSelectedSessionId(flattenedSessions[0].id);
                }
            } catch (err) {
                console.error('Failed to load sessions:', err);
                setError('Failed to load sessions');
            } finally {
                setLoadingSessions(false);
            }
        };

        fetchSessions();
    }, []);

    const selectedSession = useMemo(() => sessions.find(s => s.id === selectedSessionId) || null, [sessions, selectedSessionId]);

    const refreshTickets = async (sessionId: string) => {
        try {
            const ticketsResponse = await getSessionTickets(sessionId);
            console.log('Raw tickets response:', ticketsResponse);
            const normalized = normalizeTickets(ticketsResponse);
            console.log('Normalized tickets:', normalized);
            setTickets(normalized);
        } catch (err) {
            console.error('Failed to fetch tickets:', err);
            setTickets([]);
        }
    };

    useEffect(() => {
        const loadSessionDetails = async () => {
            if (!selectedSession) return;

            try {
                setLoadingDetails(true);
                setSelectedSeatId(null);
                setUserIdInput('');
                setCommentInput('');

                if (selectedSession.hallId) {
                    const hallResponse = await getHallById(selectedSession.hallId);
                    const { seats, availableSeatTypes } = mapHallDetailsFromApi(hallResponse);
                    console.log('🏛️ Hall seats sample:', seats.slice(0, 3).map((s: Seat) => ({ seatId: s.seatId, row: s.row, number: s.number })));
                    console.log('🏛️ All hall seat IDs:', seats.map((s: Seat) => s.seatId).join(' | '));
                    setHallSeats(seats);
                    setHallTypes(availableSeatTypes);
                } else {
                    setHallSeats([]);
                    setHallTypes([]);
                }

                await refreshTickets(selectedSession.id);
            } catch (err) {
                console.error('Failed to load session details:', err);
            } finally {
                setLoadingDetails(false);
            }
        };

        loadSessionDetails();
    }, [selectedSession]);

    const occupiedSeatIds = useMemo(() => {
        const ids = tickets.map((t: TicketInfo) => t.seatId);
        console.log('📍 Occupied seats:', ids.join(', ') || '(none)');
        return ids;
    }, [tickets]);

    const groupedByRow = useMemo(() => {
        const grouped = hallSeats.reduce((acc, seat) => {
            if (!acc[seat.row]) acc[seat.row] = [];
            acc[seat.row].push(seat);
            return acc;
        }, {} as Record<number, Seat[]>);

        return Object.keys(grouped)
            .map(Number)
            .sort((a, b) => a - b)
            .map(rowNumber => ({
                rowNumber,
                seats: grouped[rowNumber].sort((a, b) => a.number - b.number)
            }));
    }, [hallSeats]);

    const selectedTicket = selectedSeatId
        ? tickets.find(t => t.seatId === selectedSeatId) || null
        : null;

    const selectedSeat = selectedSeatId
        ? hallSeats.find(s => s.seatId === selectedSeatId) || null
        : null;

    const handleCreateReservation = async () => {
        const finalUserId = isAdminReservation ? ADMIN_USER_ID : userIdInput;
        if (!selectedSession || !selectedSeatId || !finalUserId) return;

        try {
            setActionLoading(true);
            await createTicket({
                sessionId: selectedSession.id,
                seatId: selectedSeatId,
                userId: finalUserId
            });

            setReservationNotes(prev => ({
                ...prev,
                [selectedSeatId]: commentInput
            }));

            await refreshTickets(selectedSession.id);
            setCommentInput('');
            setUserIdInput('');
            setIsAdminReservation(false);
        } catch (err) {
            console.error('Failed to create ticket:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelReservation = async () => {
        if (!selectedTicket || !selectedSession) return;

        try {
            setActionLoading(true);
            await deleteTicket(selectedTicket.id);
            setReservationNotes(prev => {
                const updated = { ...prev };
                delete updated[selectedTicket.seatId];
                return updated;
            });
            await refreshTickets(selectedSession.id);
            setSelectedSeatId(null);
        } catch (err) {
            console.error('Failed to cancel ticket:', err);
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
                            <div className={styles["session-title"]}>{session.movieTitle || 'Unknown movie'}</div>
                            <div className={styles["session-meta"]}>
                                <span>{session.hallName}</span>
                                <span>{formatSessionDate(session.startDateTime)}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles["details-panel"]}>
                {!selectedSession && <div className={styles["status-text"]}>Select a session to view reservations</div>}

                {selectedSession && (
                    <>
                        <div className={styles["details-header"]}>
                            <div>
                                <h2>{selectedSession.movieTitle}</h2>
                                <div className={styles["details-meta"]}>
                                    <span>{selectedSession.hallName}</span>
                                    <span>{formatSessionDate(selectedSession.startDateTime)}</span>
                                </div>
                            </div>
                        </div>

                        {loadingDetails ? (
                            <div className={styles["status-text"]}>Loading hall and reservations...</div>
                        ) : (
                            <div className={styles["details-content"]}>
                                <div className={styles["hall-wrapper"]}>
                                    <div className={styles["screen-label"]}>SCREEN</div>
                                    <div className={styles["hall-grid"]}>
                                        {groupedByRow.map(row => (
                                            <div key={`row-${row.rowNumber}`} className="seat-row">
                                                <span className={styles["row-label"]}>{row.rowNumber}</span>
                                                <div className={styles["seat-row-grid"]}>
                                                    {row.seats.map(seat => {
                                                        const isOccupied = occupiedSeatIds.includes(seat.seatId || '');
                                                        if (seat.row === 6 && seat.number === 9) {
                                                            console.log(`Seat 6-9: seatId="${seat.seatId}" | occupied=${isOccupied} | occupiedIds=[${occupiedSeatIds.join(', ')}]`);
                                                        }
                                                        const isSelected = selectedSeatId === seat.seatId;
                                                        const seatType = hallTypes.find(t => t.id === seat.seatTypeId);
                                                        const seatColor = getDynamicSeatColor(seatType?.name || 'standard');

                                                        return (
                                                            <button
                                                                key={seat.seatId}
                                                                className={`
                                                                    ${styles['seat-cell']} 
                                                                    ${isOccupied ? styles.occupied : ''} 
                                                                    ${isSelected ? styles.selected : ''}
                                                                `}
                                                                style={{
                                                                    backgroundColor: isOccupied ? '#f0f0f0' : seatColor,
                                                                    opacity: isOccupied ? 0.5 : 1
                                                                }}
                                                                onClick={() => setSelectedSeatId(seat.seatId || null)}
                                                                type="button"
                                                                title={`Row ${seat.row}, Seat ${seat.number}${isOccupied ? ' (Occupied)' : ''}`}
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
                                    {!selectedSeatId && (
                                        <div className={styles["status-text"]}>Select a seat to view reservation details</div>
                                    )}

                                    {selectedSeatId && selectedSeat && (
                                        <div className={styles["reservation-details"]}>
                                            <h3>Seat {selectedSeat.row}-{selectedSeat.number}</h3>

                                            {selectedTicket ? (
                                                <>
                                                    <div className={styles["detail-row"]}>
                                                        <span>Ticket ID:</span>
                                                        <span>{selectedTicket.id}</span>
                                                    </div>
                                                    <div className={styles["detail-row"]}>
                                                        <span>User ID:</span>
                                                        <span>{selectedTicket.userId || '—'}</span>
                                                    </div>
                                                    <div className={styles["detail-row"]}>
                                                        <span>Comment:</span>
                                                        <span>{reservationNotes[selectedSeatId] || '—'}</span>
                                                    </div>
                                                    <button
                                                        className={styles["action-btn danger"]}
                                                        onClick={handleCancelReservation}
                                                        disabled={actionLoading}
                                                        type="button"
                                                    >
                                                        Cancel reservation
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className={styles["checkbox-group"]}>
                                                        <input
                                                            type="checkbox"
                                                            id="admin-reservation"
                                                            checked={isAdminReservation}
                                                            onChange={(e) => {
                                                                setIsAdminReservation(e.target.checked);
                                                                if (!e.target.checked) {
                                                                    setUserIdInput('');
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor={styles["admin-reservation"]}>Admin Reservation</label>
                                                    </div>
                                                    <div className={styles["input-group"]}>
                                                        <label>User ID</label>
                                                        <input
                                                            type="text"
                                                            value={isAdminReservation ? ADMIN_USER_ID : userIdInput}
                                                            onChange={(e) => !isAdminReservation && setUserIdInput(e.target.value)}
                                                            placeholder="Enter user UUID"
                                                            disabled={isAdminReservation}
                                                        />
                                                    </div>
                                                    <div className={styles["input-group"]}>
                                                        <label>Comment</label>
                                                        <textarea
                                                            value={commentInput}
                                                            onChange={(e) => setCommentInput(e.target.value)}
                                                            placeholder="Add a note for this reservation"
                                                        />
                                                    </div>
                                                    <button
                                                        className={styles["action-btn"]}
                                                        onClick={handleCreateReservation}
                                                        disabled={actionLoading || (!isAdminReservation && !userIdInput)}
                                                        type="button"
                                                    >
                                                        Create reservation
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
