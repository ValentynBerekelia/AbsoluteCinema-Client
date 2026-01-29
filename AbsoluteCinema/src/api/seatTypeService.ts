import axiosInstance from './axiosInstance';
import { SeatType } from '../types/SeatType';

export const getSeatTypes = async (): Promise<SeatType[]> => {
    const response = await axiosInstance.get('/api/admin/seat-types');
    return response.data;
};
