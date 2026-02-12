export enum TicketStatus {
    Pending = 0,    // Awaiting payment (yellow)
    Confirmed = 1,  // Paid (green)
    Cancelled = 2   // Canceled (red/gray)
}

export interface Ticket {
    id: string;
    sessionId: string;
    seatId: string;
    userId: string;
    
    status: TicketStatus; 
    
    createdAt?: string; 
}