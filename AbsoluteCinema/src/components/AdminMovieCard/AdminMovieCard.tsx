import { useNavigate } from 'react-router-dom';
import { MovieAdminCardInfo } from '../../types/Movie';
import { TimeBadge } from '../ui/TimeBadge/TimeBadge';
import './AdminMovieCard.css';
import { Session } from '@/types/Session';

interface AdminMovieCardProps {
    movie: MovieAdminCardInfo;
    onDelete: (id: string) => void;
}

export const AdminMovieCard = ({ movie, onDelete }: AdminMovieCardProps) => {
    const navigate = useNavigate();
    const totalTickets = movie.totalTicketSold;
    const totalSeats = movie.totalCapacity;
    
    const salesPercentage = totalSeats > 0 ? Math.round((totalTickets / totalSeats) * 100) : 0;

    const getProgressColor = () => {
        if (totalSeats === 0) return '#bdc3c7';
        if (salesPercentage > 75) return '#4caf50';
        if (salesPercentage > 30) return '#ffc107';
        return '#f44336';
    };

    const groupedSessions = movie.sessions.reduce((acc, session) => {
        const date = session.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(session);
        return acc;
    }, {} as Record<string, Session[]>);

    const sortedDates = Object.keys(groupedSessions).sort((a, b) =>
        new Date(a).getTime() - new Date(b).getTime()
    );

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Delete film "${movie.title}"?`)) {
            onDelete(movie.id);
        }
    };

    return (
        <div className='admin-movie-container'>
            <button className='admin-delete-movie-btn' onClick={handleDelete} title="Delete Movie">✕</button>

            <div className='admin-movie-main-content'>
                <div className='admin-left-column'>
                    <div className='admin-movie-poster-wrapper'>
                        <img src={movie.poster} alt={movie.title} className='admin-poster-img' />
                    </div>

                    <div className='admin-stats-badge'>
                        <div className='stats-header'>
                            <span className='stats-label'>Occupancy</span>
                            <span className='stats-percentage' style={{ color: getProgressColor() }}>
                                {salesPercentage}%
                            </span>
                        </div>
                        <div className='stats-values'>
                            <span className='stats-sold'>{totalTickets}</span>
                            <span className='stats-divider'>/</span>
                            <span className='stats-total'>{totalSeats || '—'}</span>
                        </div>
                        <div className='stats-progress-bar' style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                            <div 
                                className='stats-progress-fill' 
                                style={{ 
                                    width: `${salesPercentage}%`, 
                                    backgroundColor: getProgressColor(),
                                    boxShadow: `0 0 10px ${getProgressColor()}44` 
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className='admin-right-column'>
                    <div className='admin-movie-header-info'>
                        <h2 className='admin-movie-title'>{movie.title}</h2>
                        <div className='admin-quick-meta'>
                            {/* Якщо duration приходить як 02:49:00, прибираємо зайві нулі */}
                            <span className='meta-tag duration'>
                                {movie.duration.replace(/^00:/, '').replace(/:00$/, '')}
                            </span>
                            <span className='meta-tag age'>{movie.ageLimit}+</span>
                        </div>
                    </div>

                    <div className='admin-sessions-section'>
                        <h3>Upcoming Sessions</h3>
                        <div className='sessions-by-date-group'>
                            {sortedDates.length > 0 ? (
                                sortedDates.map((date) => (
                                    <div key={date} className='date-block'>
                                        <span className='session-date-header'>
                                            {new Date(date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                                        </span>
                                        <div className='sessions-row'>
                                            {groupedSessions[date].map((session, idx) => (
                                                <TimeBadge
                                                    key={`${date}-${idx}`}
                                                    session={session}
                                                    showPastDisabled={false}
                                                    movieId={movie.id}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-sessions">No active sessions</p>
                            )}
                        </div>
                    </div>

                    <button
                        className='admin-action-btn'
                        onClick={() => navigate(`/admin/movies/edit/${movie.id}`)}
                    >
                        Edit Details & Schedule
                    </button>
                </div>
            </div>
        </div>
    );
};