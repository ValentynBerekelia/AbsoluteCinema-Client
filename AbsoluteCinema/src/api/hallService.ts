import axiosClient from './axiosClient';

export interface Hall {
    id: number;
    name: string;
    capacity: number;
    type: string;
}

export const hallService = {
    getHalls: async (): Promise<Hall[]> => {
        try {
            const response = await axiosClient.get<Hall[]>('/admin/halls');
            return response.data;
        } catch (error) {
            console.error('Error fetching halls:', error);
            throw error;
        }
    },

    getHallById: async (id: number): Promise<Hall> => {
        try {
            const response = await axiosClient.get<Hall>(`/admin/halls/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching hall ${id}:`, error);
            throw error;
        }
    },
};
