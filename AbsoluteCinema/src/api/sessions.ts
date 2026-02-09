import { CreateSessionRequest } from "@/types/Session";
import axiosInstance from "./axiosInstance";

export const createSession = async (sessionData: CreateSessionRequest) => {
    const response = await axiosInstance.post('admin/sessions', sessionData);
    return response.data;
};

export const updateSession = async (id: string, sessionData: any) => {
    const response = await axiosInstance.put(`admin/sessions/${id}`, sessionData);
    return response.data;
};

export const updateSessionPartial = async (id: string, sessionData: any) => {
    const response = await axiosInstance.patch(`admin/sessions/${id}`, sessionData);
    return response.data;
};

export const deleteSession = async (sessionId: string) => {
    const response = await axiosInstance.delete(`sessions/${sessionId}`);
    return response.data;
};

export const getMovieSessions = async (movieId: string) => {
    const response = await axiosInstance.get(`movies/${movieId}/sessions`);
    return response.data;
};

export interface BookingRequest {
    sessionId: string;
    seatIds: string[];
    userId?: string;
}

export interface BookingResult {
    success: boolean;
    bookingId: string;
    sessionId: string;
    seats: string[];
    timestamp: string;
}

export const createBooking = async (bookingData: BookingRequest): Promise<BookingResult> => {
    const { createMultipleTickets } = await import('./tickets');
    
    try {
        const userId = bookingData.userId || 'anonymous';
        
        // Create tickets for each selected seat using the API
        const ticketsResponse = await createMultipleTickets(
            bookingData.sessionId,
            bookingData.seatIds,
            userId
        );
        
        return {
            success: true,
            bookingId: `BOOKING-${Date.now()}`,
            sessionId: bookingData.sessionId,
            seats: bookingData.seatIds,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Booking failed:', error);
        throw new Error('Failed to create booking. Please try again.');
    }
};

/**
 * @deprecated Use createBooking instead
 */
export const createMockBooking = createBooking;