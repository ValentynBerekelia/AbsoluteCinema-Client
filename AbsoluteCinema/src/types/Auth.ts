export interface User {
    userId: string;
    userName?: string;
    email?: string;
    roles: string[];
    permissions: string[];
}

export interface RegisterRequest {
    userName: string;
    password: string;
    email: string;
}

export interface RegisterResponse {
    userId: string;
    accessToken: string;
    refreshToken: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    userId: string;
    userName: string;
    email: string;
    accessToken: string;
    refreshToken: string;
}

export type AuthData = LoginResponse;

export interface GetCurrentUserResponse {
    userId: string;
    userName?: string;
    roles: string[];
    permissions: string[];
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    userId: string;
    accessToken: string;
    refreshToken: string; 
}

export interface RevokeAllRefreshTokenRequest {
    userId: string;
}