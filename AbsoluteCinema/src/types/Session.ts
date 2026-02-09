import { Seat } from "./hall";

export interface Session {
    id: string;
    date: string;
    time: string;
    hallId?: string;
    movieType?: SessionFormat;
    hallName?: string;
    basePrice?: number;
    seatPrices?: Array<{
        seatTypeId: string;
        seatTypeName?: string;
        price?: number | null;
    }>;
}

export enum SessionFormat {
    TwoD = 1,
    ThreeD = 2,
}

export interface CreateSessionRequest {
    movieId: string;
    hallId: string;
    format: number;
    startTime: string;
    prices: Price[];
}

interface Price {
    seatTypeId: string;
    price: number;
}
export interface SessionFormData {
    id?: string;
    dateFrom?: string;
    dateTo?: string;
    date?: string;
    time: string;
    hallId: string;
    seatPrices: Record<string, string>;
    enabledTypes: Record<string, boolean>;
}

export const mapApiSessionToForm = (apiSession: any): SessionFormData => {
    const [date, fullTime] = (apiSession.startDateTime || apiSession.startTime || "").split('T');
    const time = fullTime ? fullTime.substring(0, 5) : "";

    return {
        id: apiSession.id || apiSession.sessionId,
        date: date,
        time: time,
        hallId: apiSession.hallId?.id || apiSession.hallId || '',
        seatPrices: apiSession.prices?.reduce((acc: any, p: any) => {
            const id = p.seatTypeId?.id || p.seatTypeId;
            acc[id] = String(p.price);
            return acc;
        }, {}) || {},
        enabledTypes: apiSession.prices?.reduce((acc: any, p: any) => {
            const id = p.seatTypeId?.id || p.seatTypeId;
            acc[id] = true;
            return acc;
        }, {}) || {}
    };
};

export const getFormatLabel = (format?: SessionFormat): string => {
    switch (format) {
        case SessionFormat.TwoD:
            return '2D';
        case SessionFormat.ThreeD:
            return '3D';
        default:
            return '';
    }
};