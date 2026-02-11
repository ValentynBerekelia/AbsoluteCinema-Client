import { defaultMoviesQueryParams, MoviesQueryParameters } from '@/types/MoviesQueryParameters';
import axiosInstance from './axiosInstance';
import { MovieRecommendation } from '@/types/Movie';

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
  url?: string;
  type: MediaType;
  file?: File | null;
}

export interface AttachMediaRequest {
  mediaId: string;
}

export interface CreateAndAttachMediaResponse {
  movieId: string;
  mediaId: string;
}

export interface AdminMovieStats {
  id: string;
  name: string;
  posterUrl: string;
  duration: string;
  ageLimit: number;
  totalTicketSold: number;
  totalCapacity: number;
  sessions: {
    id: string;
    startDateTime: string;
    format: number;
  }[];
}

export interface MovieRecommendationsResponse {
  movies: MovieRecommendation[]
};

interface AdminStatsResponse {
  movies: AdminMovieStats[];
  nextCursor: string | null;
}

export const createMovie = async (formData: FormData) => {
  const response = await axiosInstance.post('/admin/movies', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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

  console.log("Full API Response:", response.data);

  return response.data;
};

export const getMovieFeatures = async () => {
  const response = await axiosInstance.get('/movies/features', {});
  console.log("OPA", response);
  return response.data;
}

// Media API Functions
export const createAndAttachMedia = async (movieId: string, mediaData: CreateMediaRequest) => {
  const formData = new FormData();

  formData.append('Type', mediaData.type.toString());

  if (mediaData.file) {
    formData.append('File', mediaData.file);
  } else if (mediaData.url) {
    formData.append('Url', mediaData.url);
  }

  const response = await axiosInstance.post<CreateAndAttachMediaResponse>(
    `/admin/movies/${movieId}/media`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );

  return response.data;
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
  const response = await axiosInstance.post('/genres', {
    genreName
  });
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

export interface CreatePersonRequestPayload {
  fullName: string;
  bio: string;
  birthDate: string;
  role: number; // 1 = Director, 2 = Actor
}

export interface AttachPersonRequest {
  personId: string;
  role: number; // 1 = Director, 2 = Actor
}

export interface CreatePersonMediaRequestPayload {
  url: string;
}

const normalizePersonBirthDate = (birthDate: string) => {
  if (!birthDate) return birthDate;
  if (/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return `${birthDate}T00:00:00.000Z`;
  }
  if (birthDate.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(birthDate)) {
    return birthDate;
  }
  const parsed = new Date(birthDate);
  return Number.isNaN(parsed.getTime()) ? birthDate : parsed.toISOString();
};

// Create a new person and attach to movie in one call
export const createAndAttachPersonToMovie = async (movieId: string, personData: CreatePersonRequestPayload) => {
  const response = await axiosInstance.post(`/admin/movies/${movieId}/persons`, {
    fullName: personData.fullName,
    bio: personData.bio,
    birthDate: normalizePersonBirthDate(personData.birthDate),
    role: personData.role
  });
  return response.data;
};

// Attach an existing person to a movie
export const attachPersonToMovie = async (movieId: string, personId: string, role: number) => {
  const response = await axiosInstance.post(`/admin/movies/${movieId}/persons/attach`, {
    personId,
    role
  });
  return response.data;
};

export const attachGenreToMovie = async (movieId: string, genreId: string) => {
  const response = await axiosInstance.post(`/admin/movies/${movieId}/genre/attach`, {
    genreId
  });
  return response.data;
};

export const removePersonFromMovie = async (movieId: string, personId: string) => {
  const response = await axiosInstance.delete(`/admin/movies/${movieId}/persons/${personId}`);
  return response.data;
};

export const removeGenreFromMovie = async (movieId: string, genreId: string) => {
  const response = await axiosInstance.delete(`/admin/movies/${movieId}/genre/${genreId}`);
  return response.data;
};

// Additional Person API Functions
export const searchPersons = async (searchTerm?: string, role?: number, limit?: number) => {
  const params: Record<string, any> = {};
  if (searchTerm) params.Search = searchTerm;
  if (role) params.Role = role;
  if (limit) params.Limit = limit;

  const response = await axiosInstance.get('/persons', { params });
  return response.data;
};

export const getPersonById = async (personId: string) => {
  const response = await axiosInstance.get(`/persons/${personId}`);
  return response.data;
};

export const createPerson = async (personData: CreatePersonRequestPayload) => {
  const response = await axiosInstance.post('/admin/persons', {
    fullName: personData.fullName,
    bio: personData.bio,
    birthDate: normalizePersonBirthDate(personData.birthDate),
    role: personData.role
  });
  return response.data;
};

export const updatePerson = async (personId: string, personData: Partial<CreatePersonRequestPayload>) => {
  const response = await axiosInstance.put(`/admin/persons/${personId}`, {
    fullName: personData.fullName,
    bio: personData.bio,
    birthDate: personData.birthDate ? normalizePersonBirthDate(personData.birthDate) : personData.birthDate,
    role: personData.role
  });
  return response.data;
};

export const deletePerson = async (personId: string) => {
  const response = await axiosInstance.delete(`/admin/persons/${personId}`);
  return response.data;
};

export const attachMediaToPerson = async (personId: string, url: string | null) => {
  const response = await axiosInstance.post(`/admin/persons/${personId}/media`, {
    url
  });
  return response.data;
};

export const getAdminMoviesStats = async (searchTerm?: string, pageSize = 10, lastMovieId?: string) => {
  const response = await axiosInstance.get('/admin/movies/stats', {
    params: {
      searchTerm,
      pageSize,
      lastMovieId
    }
  });
  return response.data;
}

export const getMovieRecommendations = async (id: string, limit: number = 10): Promise<MovieRecommendationsResponse> => {
    const response = await axiosInstance.get<MovieRecommendationsResponse>(`/movie/${id}/recommendations`, { 
        params: { limit } 
    });
    return response.data;
};
