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