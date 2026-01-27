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