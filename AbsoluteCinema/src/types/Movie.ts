import { Genre } from "./Genre";
import { Media } from "./Media";
import { Session } from "./Session";
import inceptionImg from "@/assets/posters/Inception3-2.jpg";
import inceptionBannerImg from "@/assets/banners/Inception.jpg";
import { convertIsoToDateTime } from "@/utils/dataTimeConverters";

export interface MovieCardInfo {
    id: string;
    title: string;
    image: string;
    genre: string;
    duration: number;
    ageLimit: number;
    sessions: Session[];
    format: string; 
}

export interface MovieAdminCardInfo {
    id: string;
    title: string;
    duration: string; //cause in entity we have TimeSpan
    format: string;
    ageLimit: number;
    sessions: Session[];
    poster: string;
    halls: string[];
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
    posterUrl: string;
    bannerUrl: string;
    stills: Media[];
    trailers: Media[];
    genres: Genre[];
}
export const mapMovieDetailsFromApi = async (data: any): Promise<MovieDetails> => {
    const movieId = data.movieId?.id ?? data.id;

    return {
        id: String(movieId),
        title: data.title || data.name,
        description: data.description,
        rate: data.rate,
        duration: typeof data.duration === 'string' ? parseDuration(data.duration) : data.duration,
        ageLimit: data.ageLimit,
        country: data.country,
        studio: data.studio,
        language: data.language,
        genres: data.genres || [],
        directors: data.persons?.filter((p: any) => p.personRole === 1).map((p: any) => p.personName) || [],
        starring: data.persons?.filter((p: any) => p.personRole === 2).map((p: any) => p.personName) || [],
        
        posterUrl: data.poster?.url || '',
        bannerUrl: data.banner?.url || '',
        
        stills: data.images?.map((img: any) => ({ id: img.id, type: 'Still', url: img.url })) || [],
        trailers: data.trailers?.map((t: any) => ({ id: t.id, type: 'Video', url: t.url })) || []
    };
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
            genre: movie.genres?.map((g: any) => g.name).join(', ') ?? '',
            duration: parseDuration(movie.duration),
            ageLimit: movie.ageLimit,
            sessions: movie.sessions?.map((s: any) => ({
                id: s.id,
                ...convertIsoToDateTime(s.startDateTime),
                movieType: s.format
            })) ?? []
        };
    });
};

export const mapMoviesForAdmin = (data: any): MovieAdminCardInfo[] => {
    const movies = Array.isArray(data)
        ? data
        : data.movies ?? [data];

    return movies.map((movie: any) => {
        const id = movie.id?.id ?? movie.id;

        return {
            id: String(id),
            title: movie.name ?? '',
            duration: movie.duration,
            format: '3D',
            ageLimit: movie.ageLimit ?? 0,
            sessions: movie.sessions?.map((s: any) => ({
                id: s.id,
                ...convertIsoToDateTime(s.startDateTime),
                movieType: s.format
            })) ?? [],
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
            sessions: m.todaySessions?.map((s: any) => {
                const dateTime = convertIsoToDateTime(s.startDateTime);
                const date = dateTime.date;
                const time = dateTime.time;
                return { date, time };
            }) ?? []
        };
    });
};

const parseDuration = (durationStr: string): number => {
    const [h, m, s] = durationStr.split(':').map(Number);
    return h * 60 + m + s / 60;
};