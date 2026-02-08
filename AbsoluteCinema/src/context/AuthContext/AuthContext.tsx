import { axiosInstance } from "@/api";
import { getMe, login, logout, refresh, register, revokeAll } from "@/api/auth";
import { LoginRequest, RegisterRequest, User } from "@/types/Auth";
import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext/ToastContext";

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    loginUser: (data: LoginRequest) => Promise<void>;
    registerUser: (data: RegisterRequest) => Promise<void>;
    logoutUser: () => Promise<void>;
    revokeAllSessions: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showToast } = useToast(); // Використовуємо хук тостів
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const setAuthHeader = (token: string | null) => {
        if (token) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axiosInstance.defaults.headers.common['Authorization'];
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const res = await refresh();
                const token = res.accessToken;
                setAccessToken(token);
                setAuthHeader(token);

                const userData = await axiosInstance.get('auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(r => r.data);
                setUser(userData);
            } catch (error) {
                console.log("Not authenticated or session expired");
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const loginUser = async (data: LoginRequest) => {
        try {
            const res = await login(data);
            setAccessToken(res.accessToken);
            setAuthHeader(res.accessToken);

            const profileData = await getMe();
            setUser({
                ...profileData,
                userName: res.userName
            });
            showToast('success', `Welcome back, ${data.email}!`);
        } catch (error: any) {
            const message = error.message || "Invalid username or password";
            showToast('error', message);
            throw error;
        }
    };

    const registerUser = async (data: RegisterRequest) => {
        try {
            const res = await register(data);

            setAccessToken(res.accessToken);
            setAuthHeader(res.accessToken);

            const userData = await getMe();
            setUser({
                ...userData,
                userName: data.userName
            });

            showToast('success', "Registration successful!");
        } catch (error: any) {
            const message = error.message || "Registration failed";
            showToast('error', message);
            throw error;
        }
    };

    const logoutUser = async () => {
        try {
            await logout();
            showToast('success', "You have been logged out");
        } catch (error) {
            console.error("Logout failed on server", error);
        } finally {
            setAuthHeader(null);
            setAccessToken(null);
            setUser(null);
        }
    };

    const revokeAllSessions = async () => {
        try {
            await revokeAll();
            showToast('success', "All other sessions have been terminated");
            await logoutUser();
        } catch (error) {
            showToast('error', "Failed to revoke sessions");
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            accessToken,
            loginUser,
            registerUser,
            logoutUser,
            revokeAllSessions,
            loading
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};