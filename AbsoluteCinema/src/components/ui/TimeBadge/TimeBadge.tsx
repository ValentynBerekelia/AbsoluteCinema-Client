import { Session } from "../../../types/Session";
import './TimeBadge.css'

interface TimeBadgeProps {
    session: Session;
    showPastDisabled?: boolean;
    onclick?: () => void;
}

export const TimeBadge = ({ session, showPastDisabled=true, onclick}: TimeBadgeProps) => {
    const isPast= () => {
        if (!showPastDisabled) return false;

        const now = new Date();
        const [year, month, day] = session.date.split('-').map(Number);
        const [hours, minutes] = session.time.split(':').map(Number);

        const sessionDate = new Date(year, month - 1, day, hours, minutes);
        
        return sessionDate < now;
    };

    const past = isPast();

    return (
        <button 
            className={`time-badge ${past ? 'past' : ''}`}
            onClick={onclick}
            disabled={past}
            >
                {session.time}
        </button>
    );
};