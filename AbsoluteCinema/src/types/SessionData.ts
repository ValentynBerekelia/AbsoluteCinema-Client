export type SeatType = 'comfort' | 'vip' | 'standart' | 'broken' | 'disabled';

export interface Seat {
    id: number;
    type: SeatType | null;
}

export interface SessionFormData {
    dateFrom?: string; // For AddMovie (date range)
    dateTo?: string;   // For AddMovie (date range)
    date?: string;     // For EditMovie (fixed date)
    time: string;
    hall: string;
    averagePrice: string;
    first3RowPrice: string;
    vipPrice: string;
    seats: Seat[];
}

export interface ExpandedSession extends SessionFormData {
    id?: string;
}
