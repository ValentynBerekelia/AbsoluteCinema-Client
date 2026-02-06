import axiosInstance from './axiosInstance';

export interface CreateTicketPayload {
    sessionId: string;
    seatId: string;
    userId: string;
}

export const getSessionTickets = async (sessionId: string) => {
    const response = await axiosInstance.get(`sessions/${sessionId}/tickets`);
    return response.data;
};

export const getTicketById = async (ticketId: string) => {
    const response = await axiosInstance.get(`ticket/${ticketId}`);
    return response.data;
};

export const createTicket = async (payload: CreateTicketPayload) => {
    const response = await axiosInstance.post('ticket', payload);
    return response.data;
};

export const updateTicket = async (ticketId: string, payload: CreateTicketPayload) => {
    const response = await axiosInstance.patch(`ticket/${ticketId}`, payload);
    return response.data;
};

export const deleteTicket = async (ticketId: string) => {
    const response = await axiosInstance.delete(`ticket/${ticketId}`);
    return response.data;
};
