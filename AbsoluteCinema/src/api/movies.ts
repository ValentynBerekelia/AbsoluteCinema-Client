import { defaultMoviesQueryParams, MoviesQueryParameters } from '@/types/MoviesQueryParameters';
import { CreateMovieRequest } from '../types/CreateMovieRequest';
import axiosInstance from './axiosInstance';

export const createMovie = async (movieData: CreateMovieRequest) => {
    const response = await axiosInstance.post('/api/admin/movies', movieData);
    return response.data;
};

export const updateMovie = async (id: string | number, movieData: any) => {
    const response = await axiosInstance.put(`/api/admin/movies/${id}`, movieData);
    return response.data;
};

export const deleteMovie = async (id: string | number) => {
    const response = await axiosInstance.delete(`/api/admin/movies/${id}`);
    return response.data;
};

export const getMovies = async (params?: MoviesQueryParameters) => {
  const queryParams = { ...defaultMoviesQueryParams, ...params };
  const response = await axiosInstance.get('/api/admin/movies', { params: queryParams });
  console.log(response);
  return response.data;
};

export const getMovieById = async (id: string) => {
  const response = await axiosInstance.get(`/api/admin/movies/${id}`);
  console.log("Movie details:", response);
  return response.data;
};

// Sessions API
export const createSession = async (sessionData: {
  movieId: string;
  hallId: string;
  startDateTime: string;
  seatTypePrices?: { seatTypeId: string; price: number }[];
}) => {
    const response = await axiosInstance.post('/api/admin/sessions', sessionData);
    return response.data;
};

export const updateSession = async (id: string | number, sessionData: {
  hallId?: string;
  startDateTime?: string;
  seatTypePrices?: { seatTypeId: string; price: number }[];
}) => {
    const response = await axiosInstance.put(`/api/admin/sessions/${id}`, sessionData);
    return response.data;
};

export const deleteSession = async (id: string | number) => {
    const response = await axiosInstance.delete(`/api/admin/sessions/${id}`);
    return response.data;
};

export const getMovieSessions = async (movieId: string, pageNumber = 1, pageSize = 100) => {
    const response = await axiosInstance.get(`/api/admin/movies/${movieId}/sessions`, {
        params: { pageNumber, pageSize }
    });
    return response.data;
};