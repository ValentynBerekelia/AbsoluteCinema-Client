import inceptionImg from '../assets/banners/Inception.jpg'
import interstellarImg from '../assets/banners/Interstellar.jpg'
import matrixImg from '../assets/banners/Matrix.jpg'

export const HERO_MOVIES = [
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
    }
];