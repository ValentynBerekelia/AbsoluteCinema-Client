import inceptionImg from '../assets/posters/Inception.jpg';
import interstellarImg from '../assets/posters/Interstellar.jpg';
import matrixImg from '../assets/posters/Matrix.jpg';

export const HERO_MOVIES = [
    {
        id: 1,
        title: "Inception",
        image: inceptionImg,
        schedule: ["11:00", "14:30", "19:00", "21:00"],
        genre: "Sci-Fi",
        duration: 148,
        director: "Christopher Nolan",
        starring: "Leonardo DiCaprio",
        ageLimit: 16,
        format: "3D",
    },
    {
        id: 2,
        title: "Interstellar",
        image: interstellarImg,
        schedule: ["09:00", "12:00", "15:00", "18:00", "21:00"],
        genre: "Adventure, Drama",
        duration: 169,
        director: "Christopher Nolan",
        starring: "Matthew McConaughey",
        ageLimit: 12,
        format: "IMAX",
    },
    {
        id: 3,
        title: "Matrix",
        image: matrixImg,
        schedule: ["12:00", "15:00", "21:00"],
        genre: "Action, Sci-Fi",
        duration: 136,
        director: "Lana Wachowski",
        starring: "Keanu Reeves",
        ageLimit: 16,
        format: "2D",
    },
];