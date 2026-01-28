import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { reservationService, Reservation } from '../../../api/reservationService';
import './ReservationsPage.css';

interface Reservation {
    id: number;
    client: string;
    movie: string;
    date: string;
    time: string;
    seats: number;
    status: 'confirmed' | 'pending' | 'cancelled';
}

export const ReservationsPage = () => {
    const navigate = useNavigate();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReservations = async () => {
            // try {
            //     setLoading(true);
            //     setError(null);
            //     const data = await reservationService.getReservations();
            //     setReservations(data);
            // } catch (err) {
            //     setError('Failed to load reservations. Using mock data.');
            //     // Fallback to mock data
            //     setReservations([
            //         { id: 1, client: "John Doe", movie: "Inception", date: "2026-01-23", time: "14:30", seats: 2, status: "confirmed" },
            //         { id: 2, client: "Jane Smith", movie: "Interstellar", date: "2026-01-23", time: "18:00", seats: 3, status: "confirmed" },
            //         { id: 3, client: "Bob Johnson", movie: "The Matrix", date: "2026-01-24", time: "15:00", seats: 1, status: "pending" },
            //         { id: 4, client: "Alice Williams", movie: "Inception", date: "2026-01-24", time: "19:00", seats: 4, status: "confirmed" },
            //         { id: 5, client: "Charlie Brown", movie: "Interstellar", date: "2026-01-23", time: "21:00", seats: 2, status: "cancelled" }
            //     ]);
            // } finally {
            //     setLoading(false);
            // }
            
            // Using mock data
            setLoading(true);
            setTimeout(() => {
                setReservations([
                    { id: 1, client: "John Doe", movie: "Inception", date: "2026-01-23", time: "14:30", seats: 2, status: "confirmed" },
                    { id: 2, client: "Jane Smith", movie: "Interstellar", date: "2026-01-23", time: "18:00", seats: 3, status: "confirmed" },
                    { id: 3, client: "Bob Johnson", movie: "The Matrix", date: "2026-01-24", time: "15:00", seats: 1, status: "pending" },
                    { id: 4, client: "Alice Williams", movie: "Inception", date: "2026-01-24", time: "19:00", seats: 4, status: "confirmed" },
                    { id: 5, client: "Charlie Brown", movie: "Interstellar", date: "2026-01-23", time: "21:00", seats: 2, status: "cancelled" }
                ]);
                setLoading(false);
            }, 500);
        };

        fetchReservations();
    }, []);

    const handleViewReservation = (reservationId: number) => {
        console.log('View reservation:', reservationId);
        navigate(`/admin/reservations/${reservationId}`);
    };

    const handleConfirm = async (id: number) => {
        // try {
        //     await reservationService.confirmReservation(id);
        //     setReservations(reservations.map(r => 
        //         r.id === id ? { ...r, status: 'confirmed' as const } : r
        //     ));
        // } catch (err) {
        //     console.error('Failed to confirm reservation');
        // }
        
        // Using mock data
        console.log('Mock confirm reservation:', id);
        setReservations(reservations.map(r => 
            r.id === id ? { ...r, status: 'confirmed' as const } : r
        ));
    };

    const handleCancel = async (id: number) => {
        // try {
        //     await reservationService.cancelReservation(id);
        //     setReservations(reservations.map(r => 
        //         r.id === id ? { ...r, status: 'cancelled' as const } : r
        //     ));
        // } catch (err) {
        //     console.error('Failed to cancel reservation');
        // }
        
        // Using mock data
        console.log('Mock cancel reservation:', id);
        setReservations(reservations.map(r => 
            r.id === id ? { ...r, status: 'cancelled' as const } : r
        ));
    };

    if (loading) {
        return (
            <div className="reservations-page">
                <div className="loading-state">Loading reservations...</div>
            </div>
        );
    }

    return (
        <div className="reservations-page">
            <div className="reservations-header">
                <h2>Current Reservations</h2>
                <div className="filter-buttons">
                    <button className="filter-btn active">All</button>
                    <button className="filter-btn">Confirmed</button>
                    <button className="filter-btn">Pending</button>
                    <button className="filter-btn">Cancelled</button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {reservations.length === 0 ? (
                <div className="no-data">No reservations available yet</div>
            ) : (
                <div className="reservations-table-wrapper">
                <table className="reservations-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Client</th>
                            <th>Movie</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Seats</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.map(reservation => (
                            <tr key={reservation.id}>
                                <td>{reservation.id}</td>
                                <td>{reservation.client}</td>
                                <td>{reservation.movie}</td>
                                <td>{reservation.date}</td>
                                <td>{reservation.time}</td>
                                <td>{reservation.seats}</td>
                                <td>
                                    <span className={`status-badge status-${reservation.status}`}>
                                        {reservation.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="view-btn" onClick={() => handleViewReservation(reservation.id)}>View</button>
                                        {reservation.status === 'pending' && (
                                            <button 
                                                className="confirm-btn"
                                                onClick={() => handleConfirm(reservation.id)}
                                            >
                                                Confirm
                                            </button>
                                        )}
                                        {reservation.status !== 'cancelled' && (
                                            <button 
                                                className="cancel-btn"
                                                onClick={() => handleCancel(reservation.id)}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}
        </div>
    );
};
