import axiosClient from './axiosClient';

export interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    totalBookings: number;
}

export const clientService = {
    getClients: async (): Promise<Client[]> => {
        try {
            const response = await axiosClient.get<Client[]>('/admin/clients');
            return response.data;
        } catch (error) {
            console.error('Error fetching clients:', error);
            throw error;
        }
    },

    getClientById: async (id: number): Promise<Client> => {
        try {
            const response = await axiosClient.get<Client>(`/admin/clients/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching client ${id}:`, error);
            throw error;
        }
    },
};
