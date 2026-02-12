import axiosInstance from "./axiosInstance";

export interface ClientUser {
    userId?: string;
    id?: string;
    userName: string;
    email: string;
    roles?: string[];
    totalTickets?: number;
}

export interface GetAllUsersResponse {
    users: ClientUser[];
    totalCount: number;
    nextCursor?: string | null;
}

const normalizeUser = (user: any): ClientUser => ({
    ...user,
    userId: user.userId || user.id,
    roles: Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [],
    totalTickets: user.totalTickets || 0
});

export const getAllUsers = async (pageSize: number = 20, cursor?: string): Promise<GetAllUsersResponse> => {
    const response = await axiosInstance.get<GetAllUsersResponse>('admin/users', {
        params: {
            pageSize,
            ...(cursor && { cursor })
        }
    });
    
    // Normalize the response to ensure userId is set
    const normalizedData = {
        ...response.data,
        users: (response.data.users || []).map(normalizeUser)
    };
    
    return normalizedData;
};

export const searchUsers = async (query: string, pageSize: number = 20): Promise<GetAllUsersResponse> => {
    const response = await axiosInstance.get<GetAllUsersResponse>('admin/users/search', {
        params: {
            q: query,
            pageSize
        }
    });
    
    // Normalize the response to ensure userId is set
    const normalizedData = {
        ...response.data,
        users: (response.data.users || []).map(normalizeUser)
    };
    
    return normalizedData;
};

export const getUserById = async (userId: string): Promise<ClientUser> => {
    const response = await axiosInstance.get<ClientUser>(`admin/users/${userId}`);
    return normalizeUser(response.data);
};
