
export interface Session {
    date: string;
    time: string;
    movieType?: number;
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