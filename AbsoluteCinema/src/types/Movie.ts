export interface Session {
    date: string;
    time: string;
}

export interface Movie {
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
    Sessions: Session[];
    Halls: string[];
};
