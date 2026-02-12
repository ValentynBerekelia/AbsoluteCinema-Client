import axiosInstance from "./axiosInstance";
import { DashboardStatsResponse } from "../types/statistics";

export const getDashboardStats = async (from?: string, to?: string): Promise<DashboardStatsResponse> => {
    const response = await axiosInstance.get<DashboardStatsResponse>('/statistics/dashboard', {
        params: {
            from,
            to
        }
    });
    return response.data;
};