import axiosInstance from './axiosInstance';
import { Ticket } from '@/types/ticket';
import { GetTicketDetailsResponse } from '@/types/ticket';

export interface CreateTicketPayload {
    sessionId: string;
    seatId: string;
    userId: string;
}

export const getSessionTickets = async (sessionId: string): Promise<Ticket[]> => {
    const response = await axiosInstance.get<Ticket[]>(`sessions/${sessionId}/tickets`);
    return response.data;
};

export const getSessionTicketsShort = async (sessionId: string) => {
    const response = await axiosInstance.get(`sessions/${sessionId}/tickets/short`);
    return response.data;
};

export const getTicketById = async (ticketId: string): Promise<Ticket> => {
    const response = await axiosInstance.get<Ticket>(`ticket/${ticketId}`);
    return response.data;
};

export const createTicket = async (payload: CreateTicketPayload): Promise<Ticket> => {
    const response = await axiosInstance.post<Ticket>('ticket', payload);
    return response.data;
};

export const createMultipleTickets = async (sessionId: string, seatIds: string[], userId: string) => {
    const promises = seatIds.map(seatId =>
        createTicket({
            sessionId,
            seatId,
            userId
        })
    );
    return Promise.all(promises);
};

export const updateTicket = async (ticketId: string, payload: CreateTicketPayload) => {
    const response = await axiosInstance.patch(`ticket/${ticketId}`, payload);
    return response.data;
};

export const deleteTicket = async (ticketId: string) => {
    const response = await axiosInstance.delete(`ticket/${ticketId}`);
    return response.data;
};

export const confirmTicket = async (ticketId: string): Promise<void> => {
    await axiosInstance.post(`/ticket/${ticketId}/confirm`);
};

export const cancelTicket = async (ticketId: string): Promise<void> => {
    await axiosInstance.delete(`/ticket/${ticketId}/cancel`);
};
export const updateTicketStatus = async (ticketId: string, status: string) => {
    const response = await axiosInstance.patch(`ticket/${ticketId}`, { status });
    return response.data;
};

export const getUserTickets = async (userId: string): Promise<GetTicketDetailsResponse[]> => {
    const response = await axiosInstance.get(`tickets/user/${userId}`);
    return response.data;
};
