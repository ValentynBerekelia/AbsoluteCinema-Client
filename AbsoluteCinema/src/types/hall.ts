export type HallId = string;
export type SeatTypeId = string;

export interface SeatType {
    id: SeatTypeId;
    name: string;
}

export interface Seat {
    row: number;
    number: number;
    seatTypeId: SeatTypeId;
}

export interface Hall {
    id: HallId;
    name: string;
    seats: Seat[];
    availableSeatTypes?: SeatType[];
}

export const mapHallsListFromApi = (data: any): Hall[] => {
    const hallArray = data?.halls || [];
    return hallArray.map((hall: any) => ({
        id: hall.id?.id ?? hall.id,
        name: hall.name,
        seats: []
    }));
};

export const mapHallDetailsFromApi = (data: any) => {
    const seats = data.seats.map((s: any) => ({
        row: s.row,
        number: s.number,
        seatTypeId: s.seatTypeId?.id ?? s.seatTypeId
    }));

    const availableSeatTypes = data.availableSeatTypes.map((t: any) => ({
        id: t.seatTypeId?.id ?? t.seatTypeId,
        name: t.name
    }));

    return { seats, availableSeatTypes };
};