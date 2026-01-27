import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

const baseURL = (import.meta as any)?.env?.VITE_API_BASE_URL ?? "http://localhost:5000/api";

export const http: AxiosInstance = axios.create({
    baseURL,
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        if (!config.headers) {
            config.headers = { Authorization: `Bearer ${token}` } as any;
        } else {
            (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
        }
    }
    return config;
});
