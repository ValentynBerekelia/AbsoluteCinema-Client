import React from 'react';
import { Seat } from '../../types/hall';
import './HallGrid.css';

interface HallGridProps {
    seats: Seat[];
    enabledTypes?: Record<string, boolean>;
}

export const HallGrid: React.FC<HallGridProps> = ({ seats, enabledTypes }) => {
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
                        className={`seat-placeholder ${getSeatClass(seat.seatTypeId)} ${!isActive ? 'dimmed' : ''}`}
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

const getSeatClass = (typeId: string): string => {
    switch (typeId) {
        case '981d38ca-47b5-446b-bc9f-9bee14c1464b': return 'vip';      // Золотий
        case '5b34194d-93a3-4ec1-b3d5-c3155e94ef30': return 'comfort';  // Зелений
        default: return 'standard';                                     // Сірий
    }
};