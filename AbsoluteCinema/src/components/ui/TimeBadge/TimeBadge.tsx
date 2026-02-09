import { Session, getFormatLabel } from "../../../types/Session";
import { formatTime } from "@/utils/dataTimeConverters";
import { useNavigate } from 'react-router-dom';
import './TimeBadge.css'

interface TimeBadgeProps {
    session: Session;
    showPastDisabled?: boolean;
    onclick?: () => void;
    movieId?: string;
}

export const TimeBadge = ({ session, showPastDisabled = true, onclick, movieId }: TimeBadgeProps) => {
    const navigate = useNavigate();
    
    if (!session || !session.time) return null;

    const isPast = () => {
        if (!showPastDisabled) return false;
        try {
            const now = new Date();
            const [year, month, day] = session.date.split('-').map(Number);
            const [hours, minutes] = session.time.split(':').map(Number);
            const sessionDate = new Date(year, month - 1, day, hours, minutes);
            return sessionDate < now;
        } catch (e) {
            return false;
        }
    };

    const past = isPast();
    const formatLabel = getFormatLabel(session.movieType);
    
    const displayTime = formatTime(session.time).trim();

    const handleClick = () => {
        if (onclick) {
            onclick();
        } else if (movieId) {
            navigate(`/admin/reservations?sessionId=${session.id}`);
        }
    };

    return (
        <button 
            className={`session-badge ${past ? 'is-past' : ''}`} 
            onClick={handleClick}
            disabled={past}
            type="button"
        >
            <span className="badge-time">{displayTime}</span>
            {formatLabel && (
                <span className="badge-format">{formatLabel}</span>
            )}
        </button>
    );
};