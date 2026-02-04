import { Session, getFormatLabel } from "../../../types/Session";
import { formatTime } from "@/utils/dataTimeConverters";
import './TimeBadge.css'

interface TimeBadgeProps {
    session: Session;
    showPastDisabled?: boolean;
    onclick?: () => void;
}

export const TimeBadge = ({ session, showPastDisabled = true, onclick }: TimeBadgeProps) => {
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

    return (
        <button 
            className={`session-badge ${past ? 'is-past' : ''}`} 
            onClick={onclick}
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