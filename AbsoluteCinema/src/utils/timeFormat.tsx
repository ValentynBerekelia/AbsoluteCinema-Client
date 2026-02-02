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

export const formatTime = (dateTimeString: string | null | undefined): string => {
    if (!dateTimeString) {
        return '';
    }

    try {
        const date = new Date(dateTimeString);
        
        if (Number.isNaN(date.getTime())) {
            console.warn(`Invalid date string: ${dateTimeString}`);
            return '';
        }
        
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch (error) {
        console.error(`Error formatting time: ${dateTimeString}`, error);
        return '';
    }
};