import { Session, getFormatLabel } from "../../../types/Session";
import { formatTime } from "@/utils/dataTimeConverters";
import './TimeBadge.css'

interface TimeBadgeProps {
    session: Session;
    showPastDisabled?: boolean;
    onclick?: () => void;
}

export const TimeBadge = ({ session, showPastDisabled = true, onclick }: TimeBadgeProps) => {
    const isPast = () => {
        if (!showPastDisabled) return false;

        const now = new Date();
        const [year, month, day] = session.date.split('-').map(Number);
        const [hours, minutes] = session.time.split(':').map(Number);

        const sessionDate = new Date(year, month - 1, day, hours, minutes);
        return sessionDate < now;
    };

    const past = isPast();
    const formatLabel = getFormatLabel(session.movieType);

    return (
        <button 
            className={`session-item ${past ? 'past' : ''}`} 
            onClick={onclick}
            disabled={past}
            type="button"
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
};