
export interface CreateMovieRequest {
    name?: string;
    movieName?: string; // for backwards compatibility
    description: string;
    rate: number;
    ageLimit: number;
    durationSeconds?: number; // API uses durationSeconds
    duration?: string; // for backwards compatibility
    country: string;
    studio: string;
    language: string;
    genres?: string[];
    genreIds?: string[]; // API uses genreIds
    personIds?: string[]; // API uses personIds
}

export interface MovieFormData extends CreateMovieRequest {
    directors: string[];
    starring: string[];
    poster: File | null;
}