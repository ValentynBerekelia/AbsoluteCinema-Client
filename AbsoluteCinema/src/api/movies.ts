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
  const apiParams: Record<string, any> = {
    SearchTerm: queryParams.searchTerm,
    Genres: queryParams.genres,
    FirstDate: queryParams.firstDate,
    SecondDate: queryParams.secondDate,
    PageNumber: queryParams.pageNumber,
    PageSize: queryParams.pageSize,
    SortColumn: queryParams.sortColumn,
    SortOrder: queryParams.sortOrder === 'desc' ? 2 : 1
  };
  Object.keys(apiParams).forEach(key => apiParams[key] === undefined && delete apiParams[key]);
  const response = await axiosInstance.get('/movies', { params: apiParams });
  console.log(response);
  return response.data;
};

export const getMovieById = async (id: string) => {
  const response = await axiosInstance.get(`/movie/${id}`);
  console.log("HH", response);
  return response.data;
};

export const getMovieFeatures = async () => {
  const response = await axiosInstance.get('/movies/features', {});
  console.log("OPA", response);
  return response.data;
}
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

// Genre API Functions
export const getGenres = async (movieId?: string) => {
  const params = movieId ? { movieId } : {};
  const response = await axiosInstance.get('/genres', { params });
  return response.data;
};

export const createGenre = async (genreName: string) => {
  const response = await axiosInstance.post('/genres', { genreName });
  return response.data;
};

export const updateGenre = async (genreId: string, name: string) => {
  const response = await axiosInstance.put(`/genre/${genreId}`, { name });
  return response.data;
};

export const deleteGenre = async (genreId: string) => {
  const response = await axiosInstance.delete(`/genre/${genreId}`);
  return response.data;
};

// Person/Actor/Director API Functions
export interface Person {
  id: string;
  name: string;
  personRole: number; // 1 = Director, 2 = Actor
}

export interface AttachPersonRequest {
  personName: string;
  personRole: number; // 1 = Director, 2 = Actor
}

export const attachPersonToMovie = async (movieId: string, personName: string, personRole: number) => {
  const response = await axiosInstance.post(`/admin/movies/${movieId}/persons`, {
    personName,
    personRole
  });
  return response.data;
};

export const attachGenreToMovie = async (movieId: string, genreId: string) => {
  const response = await axiosInstance.post(`/admin/movies/${movieId}/genres`, {
    genreId
  });
  return response.data;
};

export const removePersonFromMovie = async (movieId: string, personId: string) => {
  const response = await axiosInstance.delete(`/admin/movies/${movieId}/persons/${personId}`);
  return response.data;
};

export const removeGenreFromMovie = async (movieId: string, genreId: string) => {
  const response = await axiosInstance.delete(`/admin/movies/${movieId}/genres/${genreId}`);
  return response.data;
};
