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
}

export const createMockBooking = async (bookingData: BookingRequest) => {
    // Mock implementation - в реальності це має бути POST до /bookings або /tickets
    console.log('Mock booking created:', bookingData);

    // Симулюємо успішну відповідь
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                bookingId: `BOOKING-${Date.now()}`,
                sessionId: bookingData.sessionId,
                seats: bookingData.seatIds,
                timestamp: new Date().toISOString()
            });
        }, 500);
    });
};