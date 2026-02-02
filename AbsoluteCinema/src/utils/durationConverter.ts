export const minutesToTimeSpan = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = 0;

    const h = String(hours).padStart(2, '0');
    const m = String(mins).padStart(2, '0');
    const s = String(secs).padStart(2, '0');

    return `${h}:${m}:${s}`;
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