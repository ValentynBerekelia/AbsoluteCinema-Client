
export interface CreateMovieRequest {
    movieName: string;
    description: string;
    rate: number;
    ageLimit: number;
    duration: string;
    country: string;
    studio: string;
    language: string;
    genres: string[];
}

export interface MovieFormData extends CreateMovieRequest {
    directors: string[];
    starring: string[];
    poster: File | null;
}