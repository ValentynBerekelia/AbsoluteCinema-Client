import { Genre } from "./Genre";

export interface CreateMovieRequest {
    movieName: string;
    description: string;
    rate: number;
    ageLimit: number;
    duration: string;
    country: string;
    studio: string;
    language: string;
    genres: Genre[];
}

export interface MovieFormData extends CreateMovieRequest {
    directors: string[];
    starring: string[];
    poster: File | null;
    posterUrl: string;
}