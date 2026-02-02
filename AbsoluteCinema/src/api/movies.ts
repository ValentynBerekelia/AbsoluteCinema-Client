import { defaultMoviesQueryParams, MoviesQueryParameters } from '@/types/MoviesQueryParameters';
import { CreateMovieRequest } from '../types/CreateMovieRequest';
import axiosInstance from './axiosInstance';

// Media Type Enum - matches backend API
export enum MediaType {
  Image = 1,
  PersonImage = 2,
  PosterImage = 3,
  Video = 4,
  BannerImage = 5
}

// Interfaces
export interface CreateMediaRequest {
  url: string;
  type: MediaType;
}

export interface AttachMediaRequest {
  mediaId: string;
}

export interface CreateAndAttachMediaResponse {
  movieId: string;
}

export const createMovie = async (movieData: CreateMovieRequest) => {
    const response = await axiosInstance.post('admin/movies', movieData);
    return response.data;
};

export const updateMovie = async (id: string | number, movieData: any) => {
    console.log('📡 updateMovie called with ID:', id);
    console.log('📦 Request payload:', movieData);
    try {
        const response = await axiosInstance.put(`/admin/movies/${id}`, movieData);
        console.log('✅ Update successful:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Update failed. Status:', error.response?.status);
        console.error('❌ Error response:', error.response?.data);
        throw error;
    }
};

export const updateMoviePartial = async (id: string | number, movieData: any) => {
    const response = await axiosInstance.patch(`/admin/movies/${id}`, movieData);
    return response.data;
};

export const deleteMovie = async (id: string | number) => {
    const response = await axiosInstance.delete(`/admin/movies/${id}`);
    return response.data;
};

export const getMovies = async (params?: MoviesQueryParameters) => {
  const queryParams = { ...defaultMoviesQueryParams, ...params };
  const response = await axiosInstance.get('/movies', { params: queryParams });
  console.log(response);
  return response.data;
};

export const getMovieById = async (id: string) => {
  const response = await axiosInstance.get(`/movie/${id}`);
  console.log("HH", response);
  return response.data;
};

// Media API Functions
export const createAndAttachMedia = async (movieId: string, mediaData: CreateMediaRequest) => {
  const response = await axiosInstance.post(`/admin/movies/${movieId}/media`, {
    url: mediaData.url,
    type: mediaData.type
  });
  return response.data as CreateAndAttachMediaResponse;
};

export const attachMedia = async (movieId: string, mediaId: string) => {
  const response = await axiosInstance.post(`/admin/movies/${movieId}/media/attach`, {
    mediaId: mediaId
  });
  return response.data;
};

export const deleteMedia = async (movieId: string, mediaId: string) => {
  const response = await axiosInstance.delete(`/admin/movies/${movieId}/media/${mediaId}`);
  return response.data;
};