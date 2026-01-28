
export interface CreateMovieRequest {
    movieName: string;
    description: string;
    rate: number;
    ageLimit: number;
    duration: { ticks: number; };
    country: string;
    studio: string;
    language: string;
    genres: string[];
}
