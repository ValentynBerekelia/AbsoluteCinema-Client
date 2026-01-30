import { Genre } from "./Genre";
import { Media } from "./Media";
import { Session } from "./Session";
import { convertIsoToDateTime } from "@/utils/convertToDataAndTime";
import inceptionImg from "@/assets/posters/Inception3-2.jpg";
import inceptionBannerImg from "@/assets/banners/Inception.jpg";
import { mapSessionsFromApi } from "@/utils/mapSessionFromApi";

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
    duration: string; //cause in entity we have TimeSpan
    format: string;
    ageLimit: number;
    sessions: Session[];
    halls: string[];
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
    language: string;
    directors: string[];
    starring: string[];
    medias: Media[];
    genres: Genre[];
};

export const mapMovieDetailsFromApi = async (
    data: any
): Promise<MovieDetails> => {

    let movieId = data.movieId;
    if (typeof movieId === 'object' && movieId?.id) {
        movieId = movieId.id;
    }

    const movieDetails: MovieDetails = {
        id: String(movieId),
        title: data.title,
        description: data.description,
        rate: data.rate,
        duration: data.duration,
        ageLimit: data.ageLimit,
        country: data.country,
        studio: data.studio,
        language: data.language,
        genres: data.genres,
        directors: data.persons,
        starring: data.persons,

        medias: [
            { id: 'poster', type: 'Poster', url: data.posterUrl },
            {
                id: 'video',
                type: 'Video',
                url: data.trailerUrls?.[0] ?? ''
            },
            ...(data.imageUrls?.map((u: string, index: number) => ({
                id: `still-${index}`,
                type: 'Still',
                url: u
            })) ?? []),
        ],
    };

    return movieDetails;
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
        const directors = movie.persons
            ?.filter((p: any) => p.personRole === 1)
            .map((p: any) => p.name)
            .join(', ') ?? '';
        const starring = movie.persons
            ?.filter((p: any) => p.personRole === 2)
            .map((p: any) => p.name)
            .join(', ') ?? '';

        if (typeof movieId === 'object' && movieId !== null && movieId.id) {
            movieId = movieId.id;
        }

        return {
            id: String(movieId),
            title: movie.name,
            image: movie.posterUrl ?? '',
            genre: movie.genres?.join(', ') ?? '',
            duration: parseDuration(movie.duration),
            director: directors,
            starring: starring,
            ageLimit: movie.ageLimit,
            format: '3D',
            sessions: mapSessionsFromApi(movie.sessions),
        };
    });
};

export const mapMoviesForAdmin = (data: any): MovieAdminCardInfo[] => {
    const movies = Array.isArray(data)
        ? data
        : data.movies ?? [data];

    return movies.map((movie: any) => {
        const movieId = typeof movie.id === 'object' ? movie.id.id : movie.id;

        return {
            id: String(movieId),
            title: movie.name ?? '',
            duration: movie.duration,
            format: '3D',
            ageLimit: movie.ageLimit ?? 0,
            sessions: mapSessionsFromApi(movie.sessions),
            halls: [],
            poster: movie.posterUrl ?? ''
        }
    });
}

export const mapHeroBannersFromApi = (data: any): HeroBannerInfo[] => {
    const movies = data.movies ?? (Array.isArray(data) ? data : []);

    return movies.map((m: any) => {
        const id = typeof m.movieId === 'object' ? m.movieId.id : m.movieId;

        return {
            id: String(id),
            title: m.name,
            image: m.bannerUrl,
            sessions: mapSessionsFromApi(m.todaySessions || m.sessions)
        };
    });
};

const parseDuration = (durationStr: string): number => {
    const [h, m, s] = durationStr.split(':').map(Number);
    return h * 60 + m + s / 60;
};