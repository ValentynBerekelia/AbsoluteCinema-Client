import { Genre } from "./Genre";
import { Media } from "./Media";
import { Session } from "./Session";

export interface MovieCardInfo {
    id: string;
    title: string;
    image: string;
    genre: string;
    duration: number;
    director: string;
    starring: string;
    ageLimit: number;
    format: string;
    sessions: Session[];
}

export interface MovieAdminCardInfo {
    id: string;
    title: string;
    duration : string; //cause in entity we have TimeSpan
    format: string;
    ageLimit: number;
    sessions: Session[];
    Halls: string[];
    poster: string;
};

export interface HeroBannerInfo {
    id: string;
    image: string;
    title: string;
    sessions: Session[];
};

export interface MovieDetails {
    id: string;
    title: string;
    description: string;
    rate: number;
    duration: number;
    ageLimit: number;
    country: string;
    studio: string;
    language:string;
    directors: string[];
    starring: string[];
    medias: Media[];
    genres: Genre[];
};

export interface MovieRecommendation {
    id: string;
    title: string;
    poster: string;
};

export const mapMovieFromApi = (data: any): any[] => {
    const movies = Array.isArray(data)
        ? data
        : data.movies ?? [data];

    return movies.map((movie: any) => {
        let movieId = movie.id;

        if (typeof movieId === 'object' && movieId !== null && movieId.id) {
            movieId = movieId.id;
        }

        return {
            id: String(movieId),
            title: movie.name,
            image: movie.posterUrl ?? '',
            genre: movie.genres?.join(', ') ?? '',
            duration: parseDuration(movie.duration),
            director: '',
            starring: '',
            ageLimit: movie.ageLimit,
            format: '3D',
            sessions: movie.sessionTimes?.map(convertIsoToDateTime) ?? []
        };
    });
};

const parseDuration = (durationStr: string): number => {
    const [h, m, s] = durationStr.split(':').map(Number);
    return h * 60 + m + s / 60;
};