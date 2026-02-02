import { convertIsoToDateTime } from "./convertToDataAndTime";

export const mapSessionsFromApi = (sessions: any[]): any[] => {
    return sessions?.map((s: any) => {
        const sessionId = typeof s.id === 'object' ? s.id.id : s.id;
        const dateTime = convertIsoToDateTime(s.startDateTime);
        
        return {
            id: String(sessionId),
            date: dateTime.date,
            time: dateTime.time,
            format: s.format === 1 ? '2D' : '3D',
        };
    }) ?? [];
};