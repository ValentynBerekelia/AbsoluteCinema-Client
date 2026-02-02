import React from 'react';
import { Seat, SeatType } from '../../types/hall';
import './HallGrid.css';

interface HallGridProps {
    seats: Seat[];
    seatTypes: SeatType[];
    enabledTypes?: Record<string, boolean>;
}

export const HallGrid: React.FC<HallGridProps> = ({ seats, seatTypes, enabledTypes }) => {
    if (!seats || seats.length === 0) {
        return (
            <div className="seats-grid placeholder">
                {Array.from({ length: 1 }).map((_, i) => (
                    <div key={i} className="seat-placeholder empty" />
                ))}
            </div>
        );
    }

    const maxColumns = Math.max(...seats.map(s => s.number));

    const getSeatClassByName = (typeId: string): string => {
        const type = seatTypes.find(t => t.id === typeId);

        if (!type) {
            console.warn("Type not found for ID:", typeId);
            return 'standard';
        }

        const typeName = type.name.toLowerCase();

        if (typeName.includes('vip')) return 'vip';
        if (typeName.includes('comfort')) return 'comfort';
        return 'standard';
    };
    return (
        <div
            className="seats-grid"
            style={{ gridTemplateColumns: `repeat(${maxColumns}, 28px)` }}
        >
            {seats.map((seat, i) => {
                const isActive = enabledTypes ? enabledTypes[seat.seatTypeId] : true;

                return (
                    <div
                        key={i}
                        className={`seat-placeholder ${getSeatClassByName(seat.seatTypeId)} ${!isActive ? 'dimmed' : ''}`}
                        style={{
                            gridColumn: seat.number,
                            gridRow: seat.row
                        }}
                        title={`Row: ${seat.row}, Seat: ${seat.number}`}
                    />
                );
            })}
        </div>
    );
};