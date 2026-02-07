interface DateTimeDto {
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
}

export function convertIsoToDateTime(isoString: string): DateTimeDto {
    const date = new Date(isoString);

    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');

    const hh = String(date.getUTCHours()).padStart(2, '0');
    const min = String(date.getUTCMinutes()).padStart(2, '0');

    return {
        date: `${yyyy}-${mm}-${dd}`,
        time: `${hh}:${min}`,
    };
}

export const minutesToTimeSpan = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = 0;

    const h = String(hours).padStart(2, '0');
    const m = String(mins).padStart(2, '0');
    const s = String(secs).padStart(2, '0');

    return `${h}:${m}:${s}`;
};

export const formatFullDuration = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
        .map(v => v < 10 ? "0" + v : v)
        .join(":");
};

export const formatToMinutes = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes} min`;
};

export const timeSpanToMinutes = (timeSpan: string): string => {
    const match = timeSpan.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
    if (match) return String(parseInt(match[1]) * 60 + parseInt(match[2]));
    return timeSpan;
};

export const minutesToSeconds = (minutes: string | number): number => {
    const mins = typeof minutes === 'string' ? parseInt(minutes, 10) : minutes;
    return !isNaN(mins) ? mins * 60 : 0;
};

export const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return '';

    if (timeString.includes(':') && !timeString.includes('-') && !timeString.includes('T')) {
        const parts = timeString.split(':');
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }

    try {
        const date = new Date(timeString);
        if (Number.isNaN(date.getTime())) return '';
        
        const hh = String(date.getUTCHours()).padStart(2, '0');
        const mm = String(date.getUTCMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    } catch (error) {
        return '';
    }
};

export const convertDuration = (duration: string | number | null | undefined): string => {
    if (duration === null || duration === undefined) {
        return '';
    }

    let totalMinutes: number;

    if (typeof duration === 'string') {
        // Handle TimeSpan format "HH:MM:SS" or "H:MM:SS"
        const parts = duration.split(':');
        if (parts.length >= 2) {
            const hours = Number.parseInt(parts[0], 10) || 0;
            const minutes = Number.parseInt(parts[1], 10) || 0;
            totalMinutes = hours * 60 + minutes;
        } else {
            totalMinutes = Number.parseInt(duration, 10) || 0;
        }
    } else if (typeof duration === 'number') {
        totalMinutes = duration;
    } else {
        return '';
    }

    if (Number.isNaN(totalMinutes) || totalMinutes <= 0) {
        return '';
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}min`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else {
        return `${minutes}min`;
    }
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
};