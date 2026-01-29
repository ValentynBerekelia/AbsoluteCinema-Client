export type HallId = string;
export type SeatTypeId = string;

export interface SeatType {
    id: SeatTypeId;
    name: string;
}

export interface Seat {
    row: number;
    number: number;
    seatTypeId: SeatTypeId;
}

export interface Hall {
    id: HallId;
    name: string;
    seats: Seat[];
}