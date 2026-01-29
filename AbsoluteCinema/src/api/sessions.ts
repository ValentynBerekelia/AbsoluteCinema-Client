import { CreateSessionRequest } from "@/types/Session";
import axiosInstance from "./axiosInstance";

export const createSession = async (sessionData: CreateSessionRequest) => {
    const response = await axiosInstance.post('admin/sessions', sessionData);
    return response.data;
}