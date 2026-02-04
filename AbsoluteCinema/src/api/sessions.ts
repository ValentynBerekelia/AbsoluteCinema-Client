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