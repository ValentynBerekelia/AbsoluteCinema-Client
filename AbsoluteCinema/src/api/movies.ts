import { CreateMovieRequest } from '../types/CreateMovieRequest';
import axiosInstance from './axiosInstance';

export const createMovie = async (movieData: CreateMovieRequest) => {
    const response = await axiosInstance.post('admin/movies', movieData);
    return response.data;
};

export const updateMovie = async (id: string | number, movieData: any) => {
    const response = await axiosInstance.put(`/movies/${id}`, movieData);
    return response.data;
};

export const deleteMovie = async (id: string | number) => {
    const response = await axiosInstance.delete(`/movies/${id}`);
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
  console.log(response);
  return response.data;
};

export const deleteMovie = async (id: string | number) => {
  const response = await axiosInstance.delete(`/movies/${id}`);
  return response.data;
};
