import axios from './axiosInstance';

export interface Genre {
    id: string;
    name: string;
}

interface GenreResponse {
    genres: Genre[];
}

export const getGenres = async (): Promise<Genre[]> => {
    try {
        const response = await axios.get<GenreResponse>('/genres');
        
        console.log("Genres API response:", response.data);

        if (response.data && Array.isArray(response.data.genres)) {
            return response.data.genres; 
        }
        
        if (Array.isArray(response.data)) {
            return response.data;
        }

        console.warn("Unexpected genre data format:", response.data);
        return [];
    } catch (error) {
        console.error("Error fetching genres:", error);
        return [];
    }
};