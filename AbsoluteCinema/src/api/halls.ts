import axiosInstance from './axiosInstance';

export const getHalls = async () => {
    const response = await axiosInstance.get('halls');
    return response.data;
};

export const getHallById = async (id: string) => {
    const response = await axiosInstance.get(`halls/${id}`);
    return response.data;
};

export const createHall = async (payload: { name: string }) => {
    const response = await axiosInstance.post('admin/halls', payload);
    return response.data;
};

export const updateHall = async (hallId: string, payload: { hallName: string }) => {
    const response = await axiosInstance.put(`admin/halls/${hallId}`, payload);
    return response.data;
};

export const deleteHall = async (hallId: string) => {
    const response = await axiosInstance.delete(`admin/hall/${hallId}`);
    return response.data;
};

export const addSeatsToHall = async (payload: { hallId: string; seatTypeId: string; seats: Array<{ row: number; number: number }> }) => {
    const response = await axiosInstance.post('admin/halls/seats', payload);
    return response.data;
};

export const updateSeatInHall = async (hallId: string, seatId: string, payload: { row: number; number: number; seatTypeId: string }) => {
    const response = await axiosInstance.put(`admin/halls/${hallId}/seats/${seatId}`, payload);
    return response.data;
};

export const deleteSeatFromHall = async (seatId: string) => {
    const response = await axiosInstance.delete(`admin/halls/${seatId}`);
    return response.data;
};
