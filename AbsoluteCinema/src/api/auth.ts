import { GetCurrentUserResponse, LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse, RegisterRequest, RegisterResponse, RevokeAllRefreshTokenRequest } from "@/types/Auth";
import axiosInstance from "./axiosInstance";

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<RegisterResponse>('auth/register', data);
    return response.data;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('auth/login', data);
    return response.data;
}

export const refresh = async (): Promise<RefreshTokenResponse> => {
    const response = await axiosInstance.post<RefreshTokenResponse>('auth/refresh', {});
    return response.data;
};

export const logout = async (): Promise<void> => {
    await axiosInstance.post('auth/logout', {});
}

export const revokeAll = async(): Promise<void> => {
    await axiosInstance.post('auth/revoke-all');
}

export const getMe = async (): Promise<GetCurrentUserResponse> => {
    const response = await axiosInstance.get<GetCurrentUserResponse>('auth/me');
    return response.data;
}
