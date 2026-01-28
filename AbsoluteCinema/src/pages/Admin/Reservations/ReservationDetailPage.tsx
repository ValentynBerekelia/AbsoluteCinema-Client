import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './ReservationDetailPage.css';

interface Reservation {
    id: number;
    client: string;
    movie: string;
    date: string;
    time: string;
    seats: number;
    status: 'confirmed' | 'pending' | 'cancelled';
}

export const ReservationDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [reservation, setReservation] = useState<Reservation | null>(null);

    const mockReservations: Reservation[] = [
        { id: 1, client: "John Doe", movie: "Inception", date: "2026-01-23", time: "14:30", seats: 2, status: "confirmed" },
        { id: 2, client: "Jane Smith", movie: "Interstellar", date: "2026-01-23", time: "18:00", seats: 3, status: "confirmed" },
        { id: 3, client: "Bob Johnson", movie: "The Matrix", date: "2026-01-24", time: "15:00", seats: 1, status: "pending" },
        { id: 4, client: "Alice Williams", movie: "Inception", date: "2026-01-24", time: "19:00", seats: 4, status: "confirmed" },
        { id: 5, client: "Charlie Brown", movie: "Interstellar", date: "2026-01-23", time: "21:00", seats: 2, status: "cancelled" }
    ];

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const foundReservation = mockReservations.find(r => r.id === parseInt(id || '0'));
            setReservation(foundReservation || null);
            setLoading(false);
        }, 500);
    }, [id]);

    if (loading) {
        return (
            <div className="reservation-detail-page">
                <div className="loading-state">Loading reservation...</div>
            </div>
        );
    }

    if (!reservation) {
        return (
            <div className="reservation-detail-page">
                <h2>Reservation not found</h2>
                <button onClick={() => navigate('/admin/reservations')} className="back-btn">
                    Back to Reservations
                </button>
            </div>
        );
    }

    return (
        <div className="reservation-detail-page">
            <div className="page-header">
                <h2>Reservation #{reservation.id}</h2>
                <button onClick={() => navigate('/admin/reservations')} className="back-btn">
                    Back to Reservations
                </button>
            </div>

            <div className="reservation-info">
                <div className="info-section">
                    <h3>Booking Details</h3>
                    <div className="info-item">
                        <label>Client:</label>
                        <span>{reservation.client}</span>
                    </div>
                    <div className="info-item">
                        <label>Movie:</label>
                        <span>{reservation.movie}</span>
                    </div>
                    <div className="info-item">
                        <label>Date:</label>
                        <span>{reservation.date}</span>
                    </div>
                    <div className="info-item">
                        <label>Time:</label>
                        <span>{reservation.time}</span>
                    </div>
                    <div className="info-item">
                        <label>Seats:</label>
                        <span>{reservation.seats}</span>
                    </div>
                </div>

                <div className="info-section">
                    <h3>Status</h3>
                    <div className="info-item">
                        <label>Current Status:</label>
                        <span className={`status-badge status-${reservation.status}`}>
                            {reservation.status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
