import { Genre } from "./Genre";
import { Media, MediaType } from "./Media";
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

export interface MovieAdminCardInfo {
    id: string;
    title: string;
    duration: string;
    ageLimit: number;
    poster: string;
    sessions: Session[];
    totalTicketSold: number;
    totalCapacity: number;
};

const normalizeGenres = (genres: any[]): Genre[] => {
    return (genres || []).map((g: any) => ({
        id: String(g?.id ?? g?.genreId ?? g?.name ?? g ?? ''),
        name: String(g?.name ?? g ?? '')
    }));
};

const normalizeDurationSeconds = (duration: any): number => {
    if (duration == null) return 0;
    if (typeof duration === 'number') return duration;
    if (typeof duration === 'string') {
        const parts = duration.split(':').map(Number);
        if (parts.length >= 2 && parts.every(p => !Number.isNaN(p))) {
            const [h, m, s = 0] = parts;
            return h * 3600 + m * 60 + s;
        }
        const num = Number(duration);
        return Number.isNaN(num) ? 0 : num;
    }
    if (typeof duration === 'object') {
        if (typeof duration.totalSeconds === 'number') return duration.totalSeconds;
        if (typeof duration.totalMinutes === 'number') return Math.round(duration.totalMinutes * 60);
        if (typeof duration.ticks === 'number') return Math.round(duration.ticks / 10_000_000);
    }
    return 0;
};

export const mapMovieDetailsFromApi = async (data: any): Promise<MovieDetails> => {
    const movieId = data.movieId?.id ?? data.id;

    return {
        id: String(movieId),
        title: data.title || data.name,
        description: data.description,
        rate: data.rate,
        duration: normalizeDurationSeconds(data.duration ?? data.durationSeconds),
        ageLimit: data.ageLimit,
        country: data.country,
        studio: data.studio,
        language: data.language,
        genres: normalizeGenres(data.genres),
        directors: data.persons?.filter((p: any) => p.personRole === 1).map((p: any) => p.personName) || [],
        starring: data.persons?.filter((p: any) => p.personRole === 2).map((p: any) => p.personName) || [],
        posterUrl: data.poster?.url || '',
        bannerUrl: data.banner?.url || '',
        stills: data.images?.map((img: any) => ({ id: img.id, type: MediaType.Image, url: img.url })) || [],
        trailers: data.trailers?.map((t: any) => ({ id: t.id, type: MediaType.Video, url: t.url })) || []
    };
};

export interface MovieRecommendation {
    id: string;
    name: string;
    posterUrl: string;
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
            genre: (movie.genres || []).map((g: any) => g?.name ?? g).filter(Boolean).join(', '),
            duration: parseDuration(movie.duration),
            ageLimit: movie.ageLimit,
            sessions: movie.sessions?.map((s: any) => {
                console.log('Raw session from API:', s);
                const hallId = s.hall?.id?.id || s.hall?.id || s.hallId?.id || s.hallId;
                const hallName = s.hall?.name || s.hallName;
                console.log('Extracted hallId:', hallId, 'hallName:', hallName);

                return {
                    id: String(s.id?.id ?? s.id ?? s.sessionId ?? ''),
                    ...convertIsoToDateTime(s.startDateTime),
                    movieType: s.format,
                    hallId: hallId,
                    hallName: hallName
                };
            }) ?? []
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
            ageLimit: movie.ageLimit ?? 0,
            poster: movie.posterUrl ?? '',
            totalTicketSold: movie.totalTicketSold ?? 0,
            totalCapacity: movie.totalCapacity ?? 0,
            sessions: movie.sessions?.map((s: any) => ({
                id: String(s.id?.id ?? s.id ?? ''),
                ...convertIsoToDateTime(s.startDateTime),
                movieType: s.format
            })) ?? []
        };
    });
};

export const mapHeroBannersFromApi = (data: any): HeroBannerInfo[] => {
    const movies = data.movies ?? (Array.isArray(data) ? data : []);

    return movies.map((m: any) => {
        const id = typeof m.movieId === 'object' ? m.movieId.id : m.movieId;

        return {
            id: String(id),
            title: m.name,
            image: m.bannerUrl,
            sessions: (m.todaySessions || []).map((s: any) => {
                const dateTime = convertIsoToDateTime(s.startDateTime);
                const sessionId = (() => {
                    if (typeof s.id === 'string') return s.id;
                    if (typeof s.id === 'object' && s.id?.id) return String(s.id.id);
                    if (s.sessionId) {
                        return typeof s.sessionId === 'string'
                            ? s.sessionId
                            : String(s.sessionId.id ?? '');
                    }
                    return String(s.id?.id ?? s.id ?? s.sessionId ?? '');
                })();

                return {
                    id: sessionId,
                    date: dateTime.date,
                    time: dateTime.time
                };
            })
        };
    });
};

const parseDuration = (durationStr: string): number => {
    const [h, m, s] = durationStr.split(':').map(Number);
    return h * 60 + m + s / 60;
};