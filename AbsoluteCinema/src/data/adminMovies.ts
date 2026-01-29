import { MovieAdminCardInfo } from '../types/Movie';
import inceptionImg from '../assets/posters/Inception3-2.jpg';
import interstellarImg from '../assets/posters/Interstellar3-2.jpg';
import matrixImg from '../assets/posters/Matrix3-2.jpg';

export const ADMIN_MOVIES_DATA: MovieAdminCardInfo[] = [
    {
        id: "1",
        title: "Inception",
        duration: "02:28:00", 
        format: "3D",
        ageLimit: 16,
        poster: inceptionImg,
        halls: ["Grand Hall", "Blue Room"],
        sessions: [
            { date: "2026-01-23", time: "11:00" },
            { date: "2026-01-23", time: "14:30" },
            { date: "2026-01-24", time: "19:00" }
        ]
    },
    {
        id: "2",
        title: "Interstellar",
        duration: "02:49:00",
        format: "IMAX",
        ageLimit: 12,
        poster: interstellarImg,
        halls: ["IMAX Premium"],
        sessions: [
            { date: "2026-01-23", time: "12:00" },
            { date: "2026-01-23", time: "15:00" },
            { date: "2026-01-23", time: "18:00" },
            { date: "2026-01-24", time: "21:00" }
        ]
    },
    {
        id: "3",
        title: "The Matrix",
        duration: "02:16:00",
        format: "2D",
        ageLimit: 16,
        poster: matrixImg,
        halls: ["Hall 3", "Retro Cinema"],
        sessions: [
            { date: "2026-01-23", time: "12:00" },
            { date: "2026-01-23", time: "15:00" }
        ]
    }
];