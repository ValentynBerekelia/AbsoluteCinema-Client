import { Link } from 'react-router-dom';
import { MovieCardInfo } from '../../types/Movie';
import { getFormatLabel } from '../../types/Session';
import { convertDuration } from '../../utils/durationConverter';
import { formatTime } from '../../utils/timeFormat';
import './ScheduleMovieCard.css';

interface ScheduleMovieCardProps {
    movie: MovieCardInfo;
}

export const ScheduleMovieCard = ({ movie }: ScheduleMovieCardProps) => {
    const validSessions = movie.sessions?.filter(session => {
        const time = formatTime(session.startDateTime);
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
                            const formatLabel = getFormatLabel(session.format);
                            return (
                                <div key={session.id || idx} className="session-item">
                                    <span className="session-item__time">
                                        {formatTime(session.startDateTime)}
                                    </span>
                                    {formatLabel && (
                                        <span className="session-item__format">
                                            {formatLabel}
                                        </span>
                                    )}
                                </div>
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