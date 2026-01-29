import axiosClient from './axiosClient';
import { MovieAdminCardInfo } from '../types/Movie';

export interface MovieUpdateDto {
    title: string;
    duration: string;
    format: string;
    ageLimit: number;
    halls: string[];
    description?: string;
}

export interface MovieCreateDto {
    title: string;
    description?: string;
    genre: string;
    duration: string;
    format: string;
    ageLimit: number;
    year: number;
    country: string;
    directors: string[];
    starring: string[];
    sessions: {
        dateFrom: string;
        dateTo: string;
        time: string;
        hall: string;
        prices: {
            average: number;
            first3Row: number;
            vip: number;
        };
    }[];
}

export const movieService = {
    getMovies: async (): Promise<MovieAdminCardInfo[]> => {
        try {
            const response = await axiosClient.get<MovieAdminCardInfo[]>('/admin/movies');
            return response.data;
        } catch (error) {
            console.error('Error fetching movies:', error);
            throw error;
        }
    },

    createMovie: async (data: MovieCreateDto): Promise<MovieAdminCardInfo> => {
        try {
            const response = await axiosClient.post<MovieAdminCardInfo>('/admin/movies', data);
            return response.data;
        } catch (error) {
            console.error('Error creating movie:', error);
            throw error;
        }
    },

    getMovieById: async (id: string): Promise<MovieAdminCardInfo> => {
        try {
            const response = await axiosClient.get<MovieAdminCardInfo>(`/admin/movies/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching movie ${id}:`, error);
            throw error;
        }
    },

    updateMovie: async (id: string, data: MovieUpdateDto): Promise<MovieAdminCardInfo> => {
        try {
            const response = await axiosClient.put<MovieAdminCardInfo>(`/admin/movies/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating movie ${id}:`, error);
            throw error;
        }
    },

    deleteMovie: async (id: string): Promise<void> => {
        try {
            await axiosClient.delete(`/admin/movies/${id}`);
        } catch (error) {
            console.error(`Error deleting movie ${id}:`, error);
            throw error;
        }
    },
};
