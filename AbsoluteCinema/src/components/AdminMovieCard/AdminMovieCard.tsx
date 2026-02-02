import { MovieAdminCardInfo } from '../../types/Movie';
import { TimeBadge } from '../ui/TimeBadge/TimeBadge';
import { useNavigate } from 'react-router-dom';
import './AdminMovieCard.css';

interface AdminMovieCardProps {
    movie: MovieAdminCardInfo;
}

export const AdminMovieCard = ({ movie }: AdminMovieCardProps) => {
    const navigate = useNavigate();
    
    const groupedSessions = movie.sessions.reduce((acc, session) => {
        const date = session.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(session);
        return acc;
    }, {} as Record<string, typeof movie.sessions>);

    return (
        <div className='admin-movie-container'>
            <div className='admin-movie-header-row'>
                <h2 className='admin-movie-title'>{movie.title}</h2>
                <div className='admin-halls-group'>
                    <span className='halls-label'>Hall(s):</span>
                    {movie.halls.map((hall, idx) => (
                        <span key={idx} className='admin-hall-badge'>{hall}</span>
                    ))}
                </div>
            </div>

            <div className='admin-movie-main-content'>
                <div className='admin-left-column'>
                    <div className='admin-movie-poster-wrapper'>
                        <img src={movie.poster} alt={movie.title} className='admin-poster-img' />
                    </div>

                    <div className='admin-status-block'>
                        <div className='status-item'>
                            <span>Ticket availability:</span>
                            <div className='status-row'>
                                <span className='status-box'>Add Text</span> / <span className='status-box'>Add Text</span>
                            </div>
                        </div>
                        <div className='status-item'>
                            <span>Reserved tickets:</span>
                            <div className='status-row'>
                                <span className='status-box'>Add Text</span> / <span className='status-box'>Add Text</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='admin-right-column'>
                    <div className='admin-details-section'>
                        <h3>Description</h3>
                        <div className='details-grid'>
                            <div className='detail-entry'>Duration: <span className='detail-box'>{movie.duration}</span></div>
                            <div className='detail-entry'>Format: <span className='detail-box'>{movie.format}</span></div>
                            <div className='detail-entry'>Age limit: <span className='detail-box'>{movie.ageLimit}+</span></div>
                        </div>
                    </div>

                    <div className='admin-sessions-section'>
                        <h3>Sessions</h3>
                        <div className='sessions-by-date-group'>
                            {Object.entries(groupedSessions).map(([date, sessions]) => (
                                <div key={date} className='date-block'>
                                    <span className='session-date-header'>{date}</span>
                                    <div className='sessions-row'>
                                        {sessions.map((session, idx) => (
                                            <TimeBadge
                                                key={idx}
                                                session={session}
                                                showPastDisabled={false}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        className='admin-action-btn'
                        onClick={() => navigate(`/admin/movies/edit/${movie.id}`)}
                    >
                        Edit details
                    </button>
                </div>
            </div>
        </div>
    );
};