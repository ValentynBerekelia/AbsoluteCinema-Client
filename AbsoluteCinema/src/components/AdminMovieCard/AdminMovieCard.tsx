import { useNavigate } from 'react-router-dom';
import { MovieAdminCardInfo } from '../../types/Movie';
import { TimeBadge } from '../ui/TimeBadge/TimeBadge';
import './AdminMovieCard.css';
import { useMemo } from 'react';
import { getHallById } from '@/api';

interface AdminMovieCardProps {
    movie: MovieAdminCardInfo;
    onDelete: (id: string) => void;
}

export const AdminMovieCard = ({ movie, onDelete }: AdminMovieCardProps) => {
    const navigate = useNavigate();

    const groupedSessions = movie.sessions.reduce((acc, session) => {
        const date = session.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(session);
        return acc;
    }, {} as Record<string, typeof movie.sessions>);

    const sortedDates = Object.keys(groupedSessions).sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime();
    });

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Delete film "${movie.title}"?`)) {
            onDelete(movie.id);
        }
    };

    return (
        <div className='admin-movie-container'>
            <button
                className='admin-delete-movie-btn'
                onClick={handleDelete}
                title="Delete Movie"
            >
                ✕
            </button>

            <div className='admin-movie-main-content'>
                <div className='admin-left-column'>
                    <div className='admin-movie-poster-wrapper'>
                        <img src={movie.poster} alt={movie.title} className='admin-poster-img' />
                    </div>

                    <div className='admin-stats-badge'>
                        <span className='stats-label'>Total Sales</span>
                        <div className='stats-values'>
                            <span className='stats-sold'>42</span>
                            <span className='stats-divider'>/</span>
                            <span className='stats-total'>120</span>
                        </div>
                        <div className='stats-progress-bar'>
                            <div className='stats-progress-fill' style={{ width: '35%' }}></div>
                        </div>
                    </div>
                </div>

                <div className='admin-right-column'>
                    <div className='admin-movie-header-info'>
                        <h2 className='admin-movie-title'>{movie.title}</h2>
                        <div className='admin-quick-meta'>
                            <span className='meta-tag duration'>{movie.duration}</span>
                            <span className='meta-tag age'>{movie.ageLimit}+</span>
                        </div>
                    </div>

                    <div className='admin-sessions-section'>
                        <h3>Upcoming Sessions</h3>
                        <div className='sessions-by-date-group'>
                            {sortedDates.length > 0 ? (
                                sortedDates.map((date) => (
                                    <div key={date} className='date-block'>
                                        <span className='session-date-header'>{date}</span>
                                        <div className='sessions-row'>
                                            {groupedSessions[date].map((session, idx) => (
                                                <TimeBadge
                                                    key={`${date}-${idx}`}
                                                    session={session}
                                                    showPastDisabled={false}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-sessions">No sessions scheduled</p>
                            )}
                        </div>
                    </div>

                    <button
                        className='admin-action-btn'
                        onClick={() => navigate(`/admin/movies/edit/${movie.id}`)}
                    >
                        Edit Details
                    </button>
                </div>
            </div>
        </div>
    );
};