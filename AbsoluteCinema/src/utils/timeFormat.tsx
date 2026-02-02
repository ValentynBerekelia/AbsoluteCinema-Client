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