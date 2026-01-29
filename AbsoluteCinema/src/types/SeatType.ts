export interface SeatType {
    id: string;
    name: string;
    description?: string;
}

export interface SessionSeatTypePrice {
    seatTypeId: string;
    price: number;
}
