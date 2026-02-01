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
        const result: Date[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < daysToShow; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            result.push(date);
        }
        return result;
    }, [daysToShow]);

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