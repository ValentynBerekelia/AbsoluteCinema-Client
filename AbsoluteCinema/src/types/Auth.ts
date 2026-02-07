export interface User {
    userId: string;
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
    userName: string;
    password: string;
}

export interface LoginResponse {
    userId: string;
    userName: string;
    token: string;
    accessToken: string;
    refreshToken: string;
}

export type AuthData = LoginResponse;

export interface GetCurrentUserResponse {
    userId: string;
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