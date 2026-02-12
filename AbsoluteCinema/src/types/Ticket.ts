export enum TicketStatus {
    Pending = 'Pending',
    Confirmed = 'Confirmed',
    Cancelled = 'Cancelled',
    Used = 'Used'
}

export interface SeatForTicket {
    id?: string;
    row: number;
    number: number;
    seatType?: {
        id: string;
        name: string;
    };
}

export interface HallForTickets {
    id: string;
    name: string;
}

export interface MovieForTicket {
    id: string;
    name: string;
}

export interface SessionForTicket {
    id: string;
    startDateTime: string;
    movieTitle?: string;
    hall: HallForTickets;
}

export interface UserShortInfo {
    id: string;
    email: string;
}

export interface TicketDetails {
    id: string;
    status: TicketStatus | string;
    user?: UserShortInfo;
    session: SessionForTicket;
    seat: SeatForTicket;
    price: number;
    movie?: MovieForTicket;
}

export interface GetTicketDetailsResponse extends TicketDetails {}
