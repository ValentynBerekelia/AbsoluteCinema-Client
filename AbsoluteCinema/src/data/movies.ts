import inceptionImg from '../assets/posters/Inception3-2.jpg';
import interstellarImg from '../assets/posters/Interstellar3-2.jpg';
import matrixImg from '../assets/posters/matrix3-2.jpg';

export const MOVIES = [
    {
        id: "1",
        title: "Inception",
        image: inceptionImg,
        sessions: [
            { id: "1", date: "2026-01-23", time: "11:00" },
            { id: "2", date: "2026-01-23", time: "14:30" },
            { id: "3", date: "2026-01-23", time: "19:00" },
            { id: "4", date: "2026-01-23", time: "21:00" }
        ],
        genre: "Sci-Fi",
        duration: 148,
        director: "Christopher Nolan",
        starring: "Leonardo DiCaprio",
        ageLimit: 16,
        format: "3D",
    },
    {
        id: "2",
        title: "Interstellar",
        image: interstellarImg,
        sessions: [
            { id: "5", date: "2026-01-23", time: "09:00" },
            { id: "6", date: "2026-01-23", time: "12:00" },
            { id: "7", date: "2026-01-23", time: "15:00" },
            { id: "8", date: "2026-01-23", time: "18:00" },
            { id: "9", date: "2026-01-23", time: "21:00" }
        ],
        genre: "Adventure, Drama",
        duration: 169,
        director: "Christopher Nolan",
        starring: "Matthew McConaughey",
        ageLimit: 12,
        format: "IMAX",
    },
    {
        id: "3",
        title: "Matrix",
        image: matrixImg,
        sessions: [
            { id: "10", date: "2026-01-23", time: "12:00" },
            { id: "11", date: "2026-01-23", time: "15:00" },
            { id: "12", date: "2026-01-23", time: "21:00" }
        ],
        genre: "Action, Sci-Fi",
        duration: 136,
        director: "Lana Wachowski",
        starring: "Keanu Reeves",
        ageLimit: 16,
        format: "2D",
    },
];