<<<<<<< HEAD
=======
export interface Session {
    date: string;
    time: string;
}

>>>>>>> 834622b22331f6651be5c585bed5baa69c9beb5a
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
<<<<<<< HEAD
    schedule: string[];
}
=======
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
    poster: string;
};
>>>>>>> 834622b22331f6651be5c585bed5baa69c9beb5a
