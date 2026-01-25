import inceptionImg from '../assets/banners/Inception.jpg'
import interstellarImg from '../assets/banners/Interstellar.jpg'
import matrixImg from '../assets/banners/Matrix.jpg'

export const HERO_MOVIES = [
    {
        id: "1",
        title: "Inception",
        image: inceptionImg,
        sessions: [
            { date: "2026-01-23", time: "11:00" },
            { date: "2026-01-23", time: "14:30" },
            { date: "2026-01-23", time: "19:00" },
            { date: "2026-01-23", time: "21:00" }
        ],
    },
    {
        id: "2",
        title: "Interstellar",
        image: interstellarImg,
        sessions: [
            { date: "2026-01-23", time: "09:00" },
            { date: "2026-01-23", time: "12:00" },
            { date: "2026-01-23", time: "15:00" },
            { date: "2026-01-23", time: "18:00" },
            { date: "2026-01-23", time: "21:00" }
        ],
    },
    {
        id: "3",
        title: "Matrix",
        image: matrixImg,
        sessions: [
            { date: "2026-01-23", time: "12:00" },
            { date: "2026-01-23", time: "15:00" },
            { date: "2026-01-23", time: "21:00" }
        ],
    }
];