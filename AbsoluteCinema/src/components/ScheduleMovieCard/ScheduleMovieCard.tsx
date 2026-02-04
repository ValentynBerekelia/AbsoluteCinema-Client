import { Link, useNavigate } from 'react-router-dom';
import { MovieCardInfo } from '../../types/Movie';
import { getFormatLabel } from '../../types/Session';
import './ScheduleMovieCard.css';
import { convertDuration, formatTime } from '@/utils/dataTimeConverters';

interface ScheduleMovieCardProps {
    movie: MovieCardInfo;
}

export const ScheduleMovieCard = ({ movie }: ScheduleMovieCardProps) => {
    const navigate = useNavigate();
    
    const validSessions = movie.sessions?.filter(session => {
        const time = formatTime(session.time);
        return time !== '';
    }) || [];
    
    const hasSessions = validSessions.length > 0;
    const durationText = convertDuration(movie.duration);

    return (
        <article className="schedule-card">
            <Link to={`/movie/${movie.id}`} className="schedule-card__poster">
                <img src={movie.image} alt={movie.title} />
            </Link>
            
            <div className="schedule-card__content">
                <div className="schedule-card__info">
                    <Link to={`/movie/${movie.id}`} className="schedule-card__title">
                        {movie.title}
                    </Link>
                    
                    <div className="schedule-card__meta">
                        {movie.ageLimit != null && (
                            <span className="schedule-card__age">{movie.ageLimit}+</span>
                        )}
                        {durationText && (
                            <span className="schedule-card__duration">{durationText}</span>
                        )}
                    </div>
                    
                    {movie.genre && (
                        <p className="schedule-card__genre">{movie.genre}</p>
                    )}
                </div>
                
                <div className="schedule-card__sessions">
                    {hasSessions ? (
                        validSessions.map((session, idx) => {
                            const formatLabel = getFormatLabel(session.movieType);
                            return (
                                <button 
                                    key={session.id || idx} 
                                    className="session-item"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (session.id) {
                                            navigate(`/booking/${movie.id}/${session.id}`);
                                        }
                                    }}
                                >
                                    <span className="session-item__time">
                                        {formatTime(session.time)}
                                    </span>
                                    {formatLabel && (
                                        <span className="session-item__format">
                                            {formatLabel}
                                        </span>
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <span className="schedule-card__no-sessions">No sessions available</span>
                    )}
                </div>
            </div>
        </article>
    );
};