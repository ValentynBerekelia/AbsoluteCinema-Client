import axiosClient from './axiosClient';

export interface Reservation {
    id: number;
    client: string;
    movie: string;
    date: string;
    time: string;
    seats: number;
    status: 'confirmed' | 'pending' | 'cancelled';
}

export const reservationService = {
    getReservations: async (): Promise<Reservation[]> => {
        try {
            const response = await axiosClient.get<Reservation[]>('/admin/reservations');
            return response.data;
        } catch (error) {
            console.error('Error fetching reservations:', error);
            throw error;
        }
    },

    getReservationById: async (id: number): Promise<Reservation> => {
        try {
            const response = await axiosClient.get<Reservation>(`/admin/reservations/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching reservation ${id}:`, error);
            throw error;
        }
    },

    confirmReservation: async (id: number): Promise<Reservation> => {
        try {
            const response = await axiosClient.patch<Reservation>(`/admin/reservations/${id}/confirm`);
            return response.data;
        } catch (error) {
            console.error(`Error confirming reservation ${id}:`, error);
            throw error;
        }
    },

    cancelReservation: async (id: number): Promise<Reservation> => {
        try {
            const response = await axiosClient.patch<Reservation>(`/admin/reservations/${id}/cancel`);
            return response.data;
        } catch (error) {
            console.error(`Error cancelling reservation ${id}:`, error);
            throw error;
        }
    },
};
