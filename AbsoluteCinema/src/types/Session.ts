
export interface Session {
    id: string;
    date: string;
    time: string;
    movieType?: SessionFormat;
}

export interface CreateSessionRequest {
    movieId: string;
    hallId: string;
    format: SessionFormat;
    startTime: string;
    prices: Price[];
}

interface Price {
    seatTypeId: string;
    price: number;
}

export enum SessionFormat {
    TwoD = 1,
    ThreeD = 2,
}

export const getFormatLabel = (format?: SessionFormat): string => {
  switch (format) {
    case SessionFormat.TwoD:
      return '2D';
    case SessionFormat.ThreeD:
      return '3D';
    default:
      return '';
  }
};