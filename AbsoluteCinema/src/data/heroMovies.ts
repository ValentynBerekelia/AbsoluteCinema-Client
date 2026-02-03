import inceptionImg from '../assets/banners/Inception.jpg'
import interstellarImg from '../assets/banners/Interstellar.jpg'
import matrixImg from '../assets/banners/Matrix.jpg'

export const HERO_MOVIES = [
    {
        id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        title: "Inception",
        image: inceptionImg,
        sessions: [
            { id: "1", date: "2026-02-04", time: "11:00", hallName: "Hall A", basePrice: 150 },
            { id: "2", date: "2026-02-04", time: "14:30", hallName: "Hall B", basePrice: 150 },
            { id: "3", date: "2026-02-04", time: "19:00", hallName: "Hall C", basePrice: 180 },
            { id: "4", date: "2026-02-04", time: "21:00", hallName: "Hall A", basePrice: 180 }
        ],
    },
    {
        id: "3fa85f64-5717-4562-b3fc-2c963f66afa7",
        title: "Interstellar",
        image: interstellarImg,
        sessions: [
            { id: "5", date: "2026-02-04", time: "09:00", hallName: "Hall D", basePrice: 150 },
            { id: "6", date: "2026-02-04", time: "12:00", hallName: "Hall B", basePrice: 150 },
            { id: "7", date: "2026-02-05", time: "15:00", hallName: "Hall A", basePrice: 150 },
            { id: "8", date: "2026-02-05", time: "18:00", hallName: "Hall C", basePrice: 180 },
            { id: "9", date: "2026-02-05", time: "21:00", hallName: "Hall B", basePrice: 180 }
        ],
    },
    {
        id: "3fa85f64-5717-4562-b3fc-2c963f66afa8",
        title: "Matrix",
        image: matrixImg,
        sessions: [
            { id: "10", date: "2026-02-06", time: "12:00", hallName: "Hall A", basePrice: 150 },
            { id: "11", date: "2026-02-06", time: "15:00", hallName: "Hall D", basePrice: 150 },
            { id: "12", date: "2026-02-06", time: "21:00", hallName: "Hall C", basePrice: 180 }
        ],
    }
];