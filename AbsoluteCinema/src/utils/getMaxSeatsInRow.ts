import { Seat } from "@/types/hall";

export const getMaxSeatsInRow = (seats: Seat[]): number => {
    if (seats.length === 0) return 10;
    return Math.max(...seats.map(s => s.number));
};