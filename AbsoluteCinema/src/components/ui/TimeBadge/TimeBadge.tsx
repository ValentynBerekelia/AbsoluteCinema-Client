import './TimeBadge.css'

interface TimeBadgeProps {
    time: string;
    onclick?: () => void;
}

export const TimeBadge = ({ time, onclick}: TimeBadgeProps) => {
    return (
        <button className='time-badge' onClick={onclick}>{time}</button>
    );
};