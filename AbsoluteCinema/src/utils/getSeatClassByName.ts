import { SeatType } from "@/types/hall";

export const getSeatClassByName = (seatTypes: SeatType[], typeId: string): string => {
    const type = seatTypes.find(t => t.id === typeId);
    if (!type) return 'standard';
    const name = type.name.toLowerCase();
    if (name.includes('vip')) return 'vip';
    if (name.includes('comfort')) return 'comfort';
    return 'standard';
}