import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './HallSchedulePage.css';

interface Session {
    id: number;
    movie: string;
    date: string;
    time: string;
}

export const HallSchedulePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState<Session[]>([]);

    const mockSessions: Session[] = [
        { id: 1, movie: "Inception", date: "2026-01-28", time: "14:30" },
        { id: 2, movie: "Interstellar", date: "2026-01-28", time: "18:00" },
        { id: 3, movie: "The Matrix", date: "2026-01-29", time: "15:00" },
        { id: 4, movie: "Inception", date: "2026-01-29", time: "19:00" }
    ];

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setSessions(mockSessions);
            setLoading(false);
        }, 500);
    }, [id]);

    if (loading) {
        return (
            <div className="hall-schedule-page">
                <div className="loading-state">Loading schedule...</div>
            </div>
        );
    }

    return (
        <div className="hall-schedule-page">
            <div className="page-header">
                <h2>Hall {id} Schedule</h2>
                <button onClick={() => navigate('/admin/halls')} className="back-btn">
                    Back to Halls
                </button>
            </div>

            <div className="schedule-content">
                {sessions.length === 0 ? (
                    <div className="no-data">No sessions scheduled</div>
                ) : (
                    <div className="sessions-list">
                        {sessions.map(session => (
                            <div key={session.id} className="session-item">
                                <div className="session-info">
                                    <h3>{session.movie}</h3>
                                    <p className="session-date">{session.date}</p>
                                    <p className="session-time">{session.time}</p>
                                </div>
                                <button className="view-btn">View Details</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
