import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieSessions, createBooking } from '@/api/sessions';
import { getMovieById } from '@/api/movies';
import { getHallById } from '@/api/halls';
import { getMe } from '@/api/auth';
import { SeatSelection } from '@/components/SeatSelection/SeatSelection';
import { mapHallDetailsFromApi } from '@/types/hall';
import { convertIsoToDateTime } from '@/utils/dataTimeConverters';
import './BookingPage.css';

interface SessionData {
    id: string;
    movieTitle: string;
    startDateTime: string;
    hallId: string;
    hallName: string;
    format: number;
    prices: Array<{
        seatTypeId: string;
        price: number;
    }>;
    occupiedSeats?: string[];
}

interface BookingResult {
    success: boolean;
    bookingId: string;
    sessionId: string;
    seats: string[];
    timestamp: string;
}

export const BookingPage = () => {
    const { movieId, sessionId } = useParams<{ movieId: string; sessionId: string }>();
    const navigate = useNavigate();
    
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [hallSeats, setHallSeats] = useState<any[]>([]);
    const [hallTypes, setHallTypes] = useState<any[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bookingInProgress, setBookingInProgress] = useState(false);
    const [userId, setUserId] = useState<string>('');

    useEffect(() => {
        const fetchSessionAndHall = async () => {
            if (!sessionId || !movieId) {
                setError('Session ID is missing');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Отримуємо дані про сеанси фільму та знаходимо потрібний
                const [sessionsResponse, movieResponse] = await Promise.all([
                    getMovieSessions(movieId),
                    getMovieById(movieId)
                ]);
                const sessionsList = Array.isArray(sessionsResponse)
                    ? sessionsResponse
                    : sessionsResponse.sessions ?? [];
                const foundSession = sessionsList.find((s: any) => {
                    const id = String(s.id?.id ?? s.id ?? s.sessionId ?? '');
                    return id === sessionId;
                });

                if (!foundSession) {
                    throw new Error('Session not found');
                }

                const rawPrices = foundSession.prices ?? foundSession.seatPrices ?? [];
                const pricesArray = Array.isArray(rawPrices)
                    ? rawPrices
                    : Object.keys(rawPrices || {}).map((seatTypeId: string) => ({
                        seatTypeId,
                        price: Number(rawPrices[seatTypeId])
                    }));

                const session: SessionData = {
                    id: String(foundSession.id?.id ?? foundSession.id ?? foundSession.sessionId ?? sessionId),
                    movieTitle: movieResponse?.title || foundSession.movieTitle || foundSession.movie?.title || 'Unknown Movie',
                    startDateTime: foundSession.startDateTime || foundSession.startTime,
                    hallId: foundSession.hallId?.id || foundSession.hallId || foundSession.hall?.id,
                    hallName: foundSession.hallName || foundSession.hall?.name || 'Unknown Hall',
                    format: foundSession.format || 1,
                    prices: pricesArray,
                    occupiedSeats: foundSession.occupiedSeats || []
                };

                setSessionData(session);

                // Отримуємо дані про зал
                if (session.hallId) {
                    const hallResponse = await getHallById(session.hallId);
                    console.log('Hall details:', hallResponse);
                    
                    const { seats, availableSeatTypes } = mapHallDetailsFromApi(hallResponse);
                    setHallSeats(seats);
                    setHallTypes(availableSeatTypes);

                    const resolvedHallName = hallResponse?.name || hallResponse?.hallName || hallResponse?.hall?.name;
                    if (resolvedHallName) {
                        setSessionData(prev => prev ? { ...prev, hallName: resolvedHallName } : prev);
                    }
                }
            } catch (err: any) {
                console.error('Failed to fetch session details:', err);
                setError(err.message || 'Failed to load booking information');
            } finally {
                setLoading(false);
            }
        };

        fetchSessionAndHall();
    }, [sessionId, movieId]);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userData = await getMe();
                setUserId(userData.userId);
            } catch (err) {
                console.error('Failed to fetch user data:', err);
                // Continue without userId - booking can be done anonymously if needed
            }
        };

        fetchUserId();
    }, []);

    const handleSelectionChange = (seats: string[]) => {
        setSelectedSeats(seats);
    };

    const handleBooking = async () => {
        if (selectedSeats.length === 0) {
            alert('Please select at least one seat');
            return;
        }

        if (!sessionId || !movieId) return;

        try {
            setBookingInProgress(true);
            
            const result = await createBooking({
                sessionId,
                seatIds: selectedSeats,
                userId: userId || undefined
            });

            console.log('Booking result:', result);
            
            alert(`Booking successful!\nBooking ID: ${result.bookingId}\nSeats: ${selectedSeats.length}`);
            
            // Return to home page
            navigate('/');
        } catch (err: any) {
            console.error('Booking failed:', err);
            alert('Booking failed: ' + (err.message || 'Please try again.'));
        } finally {
            setBookingInProgress(false);
        }
    };

    const getPricesMap = (): Record<string, number> => {
        if (!sessionData?.prices) return {};
        
        return sessionData.prices.reduce((acc, p) => {
            const typeId = typeof p.seatTypeId === 'object' ? (p.seatTypeId as any).id : p.seatTypeId;
            acc[typeId] = p.price;
            return acc;
        }, {} as Record<string, number>);
    };

    const pricesMap = getPricesMap();
    const selectedSeatDetails = selectedSeats
        .map(seatId => {
            const seat = hallSeats.find(s => s.seatId === seatId);
            if (!seat) return null;
            const typeName = hallTypes.find(t => t.id === seat.seatTypeId)?.name || 'Standard';
            const price = pricesMap[seat.seatTypeId] || 0;
            return { seatId, row: seat.row, number: seat.number, typeName, price };
        })
        .filter(Boolean) as Array<{ seatId: string; row: number; number: number; typeName: string; price: number }>;

    const totalPrice = selectedSeatDetails.reduce((sum, seat) => sum + seat.price, 0);

    const groupedByType = selectedSeatDetails.reduce((acc, seat) => {
        if (!acc[seat.typeName]) acc[seat.typeName] = { count: 0, total: 0 };
        acc[seat.typeName].count += 1;
        acc[seat.typeName].total += seat.price;
        return acc;
    }, {} as Record<string, { count: number; total: number }>);

    const formatDateTime = (dateTimeStr: string) => {
        if (!dateTimeStr) return '';
        const date = new Date(dateTimeStr);
        const { date: dateStr, time } = convertIsoToDateTime(dateTimeStr);
        
        const weekday = date.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
        const day = date.getUTCDate();
        const month = date.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });
        const year = date.getUTCFullYear();
        
        return `${weekday}, ${month} ${day}, ${year}, ${time}`;
    };

    if (loading) {
        return (
            <div className="booking-page">
                <div className="booking-page__loading">Loading session details...</div>
            </div>
        );
    }

    if (error || !sessionData) {
        return (
            <div className="booking-page">
                <div className="booking-page__error">
                    {error || 'Session not found'}
                    <button onClick={() => navigate('/')} className="btn-back">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page">
            <div className="booking-page__header">
                <button onClick={() => navigate(-1)} className="btn-back">
                    ← Back
                </button>
                <h1 className="booking-page__title">{sessionData.movieTitle}</h1>
                <div className="booking-page__session-info">
                    <span className="session-info-item">
                        <strong>Hall:</strong> {sessionData.hallName}
                    </span>
                    <span className="session-info-item">
                        <strong>Time:</strong> {formatDateTime(sessionData.startDateTime)}
                    </span>
                    <span className="session-info-item">
                        <strong>Format:</strong> {sessionData.format === 2 ? '3D' : '2D'}
                    </span>
                </div>
            </div>

            <div className="booking-page__content">
                <div className="booking-page__layout">
                    <aside className="booking-page__sidebar">
                        <h3 className="sidebar-title">Ticket details</h3>
                        <div className="sidebar-block">
                            <div className="sidebar-row">
                                <span>Movie</span>
                                <strong>{sessionData.movieTitle}</strong>
                            </div>
                            <div className="sidebar-row">
                                <span>Hall</span>
                                <strong>{sessionData.hallName}</strong>
                            </div>
                            <div className="sidebar-row">
                                <span>Time</span>
                                <strong>{formatDateTime(sessionData.startDateTime)}</strong>
                            </div>
                        </div>

                        <div className="sidebar-block">
                            <h4>Selected seats</h4>
                            {selectedSeatDetails.length > 0 ? (
                                <ul className="seat-list">
                                    {selectedSeatDetails.map(seat => (
                                        <li key={seat.seatId}>
                                            Row {seat.row}, Seat {seat.number} · {seat.typeName}
                                            <span>${seat.price.toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="seat-empty">No seats selected</p>
                            )}
                        </div>

                        <div className="sidebar-block">
                            <h4>Price breakdown</h4>
                            {Object.keys(groupedByType).length > 0 ? (
                                <ul className="price-list">
                                    {Object.entries(groupedByType).map(([type, data]) => (
                                        <li key={type}>
                                            {type} × {data.count}
                                            <span>${data.total.toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="seat-empty">Select seats to see pricing</p>
                            )}
                        </div>

                        <div className="sidebar-total">
                            <span>Total</span>
                            <strong>${totalPrice.toFixed(2)}</strong>
                        </div>
                    </aside>

                    <section className="booking-page__map">
                        {hallSeats.length > 0 ? (
                            <SeatSelection
                                seats={hallSeats}
                                seatTypes={hallTypes}
                                occupiedSeats={sessionData.occupiedSeats}
                                onSelectionChange={handleSelectionChange}
                                prices={pricesMap}
                                showSummary={false}
                            />
                        ) : (
                            <div className="booking-page__no-seats">
                                No seats available for this session
                            </div>
                        )}
                    </section>
                </div>
            </div>

            <div className="booking-page__footer">
                <button
                    onClick={handleBooking}
                    disabled={selectedSeats.length === 0 || bookingInProgress}
                    className="btn-book"
                >
                    {bookingInProgress ? 'Processing...' : `Book ${selectedSeats.length} Ticket${selectedSeats.length !== 1 ? 's' : ''}`}
                </button>
            </div>
        </div>
    );
};
