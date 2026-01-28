import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MOVIES } from '../../data/movies';
import './BookingPage.css';

export const BookingPage = () => {
    const { movieId, sessionIndex } = useParams<{ movieId: string; sessionIndex: string }>();
    const navigate = useNavigate();
    const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [movie, setMovie] = useState<any>(null);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const foundMovie = MOVIES.find(m => m.id === movieId);
            setMovie(foundMovie);
            setLoading(false);
        }, 500);
    }, [movieId]);

    if (loading) {
        return (
            <div className="booking-page">
                <div className="loading-state">Loading booking...</div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="booking-page">
                <h2>Movie not found</h2>
                <button onClick={() => navigate('/')} className="back-btn">
                    Back to Home
                </button>
            </div>
        );
    }

    const session = movie.sessions?.[parseInt(sessionIndex || '0')];
    const sessionTime = session ? `${session.date} at ${session.time}` : 'Unknown';
    const totalSeats = 60;
    const seatsPerRow = 10;

    const handleSeatClick = (seatNum: number) => {
        setSelectedSeats(prev => 
            prev.includes(seatNum) 
                ? prev.filter(s => s !== seatNum)
                : [...prev, seatNum]
        );
    };

    const handleBooking = () => {
        if (selectedSeats.length === 0) {
            alert('Please select at least one seat');
            return;
        }
        console.log('Booking:', {
            movie: movie.title,
            session: sessionTime,
            seats: selectedSeats,
            price: selectedSeats.length * 150
        });
        alert(`Booking confirmed! Seats: ${selectedSeats.join(', ')}, Total: $${selectedSeats.length * 150}`);
        navigate('/');
    };

    return (
        <div className="booking-page">
            <div className="booking-header">
                <button onClick={() => navigate(`/movie/${movieId}`)} className="back-btn">
                    ← Back
                </button>
                <h1>{movie.title}</h1>
                <p className="session-info">{sessionTime}</p>
            </div>

            <div className="booking-content">
                <div className="seats-section">
                    <h2>Select Your Seats</h2>
                    <div className="screen">SCREEN</div>
                    
                    <div className="seats-grid">
                        {Array.from({ length: totalSeats }).map((_, index) => {
                            const seatNum = index + 1;
                            const isSelected = selectedSeats.includes(seatNum);
                            return (
                                <button
                                    key={seatNum}
                                    className={`seat ${isSelected ? 'selected' : 'available'}`}
                                    onClick={() => handleSeatClick(seatNum)}
                                    title={`Seat ${seatNum}`}
                                >
                                    {seatNum}
                                </button>
                            );
                        })}
                    </div>

                    <div className="seats-legend">
                        <div className="legend-item">
                            <div className="seat-indicator available"></div>
                            <span>Available</span>
                        </div>
                        <div className="legend-item">
                            <div className="seat-indicator selected"></div>
                            <span>Selected</span>
                        </div>
                        <div className="legend-item">
                            <div className="seat-indicator occupied"></div>
                            <span>Occupied</span>
                        </div>
                    </div>
                </div>

                <div className="booking-summary">
                    <h2>Booking Summary</h2>
                    
                    <div className="summary-item">
                        <span>Movie:</span>
                        <strong>{movie.title}</strong>
                    </div>
                    
                    <div className="summary-item">
                        <span>Time:</span>
                        <strong>{sessionTime}</strong>
                    </div>
                    
                    <div className="summary-item">
                        <span>Selected Seats:</span>
                        <strong>{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</strong>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-item price">
                        <span>Total Price:</span>
                        <strong className="total">${selectedSeats.length * 150}</strong>
                    </div>

                    <button 
                        className="book-btn" 
                        onClick={handleBooking}
                        disabled={selectedSeats.length === 0}
                    >
                        Complete Booking
                    </button>

                    <button 
                        className="cancel-btn"
                        onClick={() => navigate(`/movie/${movieId}`)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
