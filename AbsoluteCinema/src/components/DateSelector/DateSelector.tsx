import { useMemo } from 'react';
import './DateSelector.css';

interface DateSelectorProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    daysToShow?: number;
}

export const DateSelector = ({ 
    selectedDate, 
    onDateChange, 
    daysToShow = 7 
}: DateSelectorProps) => {
        const dates = useMemo(() => {
        const start = new Date();
        const utcStart = new Date(
            Date.UTC(
                start.getUTCFullYear(),
                start.getUTCMonth(),
                start.getUTCDate()
            )
        );

        return Array.from({ length: daysToShow }, (_, i) =>
            new Date(utcStart.getTime() + i * 24 * 60 * 60 * 1000)
        );
    }  , [daysToShow]);

    const formatDateLabel = (date: Date, index: number): string => {
        if (index === 0) return 'Today';
        if (index === 1) return 'Tomorrow';
        
        return date.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short' 
        });
    };

    const formatWeekday = (date: Date): string => {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    const isSameDay = (date1: Date, date2: Date): boolean => {
        return date1.toDateString() === date2.toDateString();
    };

    return (
        <div className="date-selector">
            {dates.map((date, index) => (
                <button
                    key={date.toISOString()}
                    className={`date-selector__item ${isSameDay(date, selectedDate) ? 'date-selector__item--active' : ''}`}
                    onClick={() => onDateChange(date)}
                    type="button"
                >
                    <span className="date-selector__label">{formatDateLabel(date, index)}</span>
                    <span className="date-selector__weekday">{formatWeekday(date)}</span>
                </button>
            ))}
        </div>
    );
};