import { MovieDetails } from "../types/Movie";
import inceptionImg from '../assets/posters/Inception3-2.jpg'
import inceptionBannerImg from '../assets/banners/Inception.jpg'
export const MOCK_MOVIE_DETAILS: MovieDetails = {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    title: "Inception",
    description: "A mind-bending thriller where dream invasion is possible...",
    rate: 8.7,
    duration: 8880,
    ageLimit: 16,
    country: "USA",
    studio: "Warner Bros.",
    language: "English",
    genres: [{ id: "1", name: "Sci-Fi" }, { id: "2", name: "Action" }],
    directors: ["asd"],
    starring: ["asd"],
    medias: [
        { id: "m1", type: "Poster", url: inceptionImg },
        { id: "m2", type: "Video", url: "https://www.youtube.com/watch?v=YoHD9XEInc0" },
        { id: "m3", type: "Still", url: inceptionImg },
        { id: "m4", type: "Still", url: inceptionBannerImg },
        { id: "m5", type: "Still", url: inceptionImg },
        { id: "m6", type: "Still", url: inceptionBannerImg },
    ],
};