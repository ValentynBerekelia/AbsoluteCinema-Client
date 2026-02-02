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