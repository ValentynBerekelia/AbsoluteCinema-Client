import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { hallService, Hall } from '../../../api/hallService';
import './HallsPage.css';

interface Hall {
    id: number;
    name: string;
    capacity: number;
    type: string;
}

export const HallsPage = () => {
    const navigate = useNavigate();
    const [halls, setHalls] = useState<Hall[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHalls = async () => {
            // try {
            //     setLoading(true);
            //     setError(null);
            //     const data = await hallService.getHalls();
            //     setHalls(data);
            // } catch (err) {
            //     setError('Failed to load halls. Using mock data.');
            //     // Fallback to mock data
            //     setHalls([
            //         { id: 1, name: "Grand Hall", capacity: 200, type: "Premium" },
            //         { id: 2, name: "Blue Room", capacity: 150, type: "Standard" },
            //         { id: 3, name: "IMAX Premium", capacity: 300, type: "IMAX" },
            //         { id: 4, name: "Hall 3", capacity: 100, type: "Standard" },
            //         { id: 5, name: "Retro Cinema", capacity: 80, type: "Classic" }
            //     ]);
            // } finally {
            //     setLoading(false);
            // }
            
            // Using mock data
            setLoading(true);
            setTimeout(() => {
                setHalls([
                    { id: 1, name: "Grand Hall", capacity: 200, type: "Premium" },
                    { id: 2, name: "Blue Room", capacity: 150, type: "Standard" },
                    { id: 3, name: "IMAX Premium", capacity: 300, type: "IMAX" },
                    { id: 4, name: "Hall 3", capacity: 100, type: "Standard" },
                    { id: 5, name: "Retro Cinema", capacity: 80, type: "Classic" }
                ]);
                setLoading(false);
            }, 500);
        };

        fetchHalls();
    }, []);

    const handleEditHall = (hallId: number) => {
        console.log('Edit hall:', hallId);
        navigate(`/admin/halls/${hallId}/edit`);
    };

    const handleViewSchedule = (hallId: number) => {
        console.log('View schedule for hall:', hallId);
        navigate(`/admin/halls/${hallId}/schedule`);
    };

    const handleAddNewHall = () => {
        console.log('Add new hall');
        navigate('/admin/halls/add');
    };

    if (loading) {
        return (
            <div className="halls-page">
                <div className="loading-state">Loading halls...</div>
            </div>
        );
    }

    return (
        <div className="halls-page">
            <div className="halls-header">
                <h2>Cinema Halls</h2>
                <button className="add-hall-btn" onClick={handleAddNewHall}>Add New Hall</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {halls.length === 0 ? (
                <div className="no-data">No halls available yet</div>
            ) : (
                <div className="halls-grid">
                {halls.map(hall => (
                    <div key={hall.id} className="hall-card">
                        <div className="hall-card-header">
                            <h3>{hall.name}</h3>
                            <span className="hall-type-badge">{hall.type}</span>
                        </div>
                        <div className="hall-info">
                            <div className="info-item">
                                <span className="info-label">Capacity:</span>
                                <span className="info-value">{hall.capacity} seats</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Status:</span>
                                <span className="info-value status-active">Active</span>
                            </div>
                        </div>
                        <div className="hall-actions">
                            <button className="edit-hall-btn" onClick={() => handleEditHall(hall.id)}>Edit</button>
                            <button className="view-schedule-btn" onClick={() => handleViewSchedule(hall.id)}>View Schedule</button>
                        </div>
                    </div>
                ))}
                </div>
            )}
        </div>
    );
};
