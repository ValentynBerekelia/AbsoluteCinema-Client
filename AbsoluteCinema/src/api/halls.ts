import axiosInstance from './axiosInstance';

export const getHalls = async () => {
    const response = await axiosInstance.get('halls');
    return response.data;
};

export const getHallById = async (id: string) => {
    const response = await axiosInstance.get(`halls/${id}`);
    return response.data;
};
