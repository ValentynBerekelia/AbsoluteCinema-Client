export interface SessionSeatTypePrice {
    seatTypeId: string;
    price: number;
}

export interface SessionCreateRequest {
    movieId: string;
    hallId: string;
    startDateTime: string; // ISO datetime string
    seatTypePrices?: SessionSeatTypePrice[]; // Optional array of prices per seat type
}

export interface SessionUpdateRequest {
    hallId?: string;
    startDateTime?: string; // ISO datetime string
    seatTypePrices?: SessionSeatTypePrice[]; // Optional array of prices per seat type
}

export interface SessionResponse {
    id: string;
    movieId: string;
    startDateTime: string;
    hallId: string;
    availableSeatsCount: number;
}

export interface SessionFormData {
    id: string;
    date: string; // date input value (YYYY-MM-DD)
    time: string; // time input value (HH:MM)
    hall: string; // hall name or id
    seatTypePrices: { [seatTypeId: string]: string }; // prices per seat type
}
