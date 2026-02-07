import React, { useMemo } from 'react';
import { Seat, SeatType } from '../../types/hall';
import './HallGrid.css';
import { getDynamicSeatColor } from '@/utils/colorGenerator';

interface HallGridProps {
    seats: Seat[];
    seatTypes: SeatType[];
    enabledTypes?: Record<string, boolean>;
}

export const HallGrid: React.FC<HallGridProps> = ({ seats, seatTypes, enabledTypes }) => {
    const rows = useMemo(() => {
        const grouped: Record<number, Seat[]> = {};
        seats.forEach(seat => {
            if (!grouped[seat.row]) grouped[seat.row] = [];
            grouped[seat.row].push(seat);
        });
        Object.values(grouped).forEach(rowSeats => rowSeats.sort((a, b) => a.number - b.number));
        return grouped;
    }, [seats]);

    const getSeatClassByName = (typeId: string): string => {
        const type = seatTypes.find(t => t.id === typeId);
        if (!type) return 'standard';
        const typeName = type.name.toLowerCase();
        if (typeName.includes('vip')) return 'vip';
        if (typeName.includes('comfort')) return 'comfort';
        return 'standard';
    };

    if (!seats || seats.length === 0) return <div className="hall-container">No layout available</div>;

    return (
        <div className="hall-container">
            <div className="screen-indicator">SCREEN</div>
            <div className="hall-rows-wrapper">
                {Object.entries(rows).map(([rowNumber, rowSeats]) => (
                    <div key={rowNumber} className="seat-row">
                        {rowSeats.map((seat, i) => {
                            const typeObj = seatTypes.find(t => t.id === seat.seatTypeId);
                            const seatColor = getDynamicSeatColor(typeObj?.name || 'standard');
                            
                            const isActive = enabledTypes ? enabledTypes[seat.seatTypeId] : true;
                            return (
                                <div
                                    key={i}
                                    className={`seat-item ${!isActive ? 'dimmed' : ''}`}
                                    style={{
                                        backgroundColor: seatColor,
                                        opacity: isActive ? 1: 0.3
                                    }}
                                    title={`Row: ${seat.row}, Seat: ${seat.number}`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};