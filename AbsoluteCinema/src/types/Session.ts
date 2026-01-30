
export interface Session {
    id: string;
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