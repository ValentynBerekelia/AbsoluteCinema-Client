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
    const groupedByRow = useMemo(() => {
        const acc: Record<number, Seat[]> = {};
        seats.forEach(seat => {
            if (!acc[seat.row]) acc[seat.row] = [];
            acc[seat.row].push(seat);
        });
        return acc;
    }, [seats]);

    const rows = useMemo(() => {
        return Object.keys(groupedByRow)
            .map(Number)
            .sort((a, b) => a - b);
    }, [groupedByRow]);

    if (!seats || seats.length === 0) return <div className="hall-container">No layout available</div>;

    return (
        <div className="hall-container">
            <div className="screen-indicator"></div>
            <div className="hall-rows-wrapper">
                {rows.map(rowNumber => {
                    const rowSeats = groupedByRow[rowNumber].sort((a, b) => a.number - b.number);
                    
                    return (
                        <div key={rowNumber} className="seat-row">
                            <span className="row-label">{rowNumber}</span>
                            
                            <div className="seat-row__flex-container">
                                {rowSeats.map(seat => {
                                    const typeObj = seatTypes.find(t => t.id === seat.seatTypeId);
                                    const seatColor = getDynamicSeatColor(typeObj?.name || 'standard');
                                    const isActive = enabledTypes ? enabledTypes[seat.seatTypeId] : true;

                                    return (
                                        <div
                                            key={seat.seatId}
                                            className={`seat-item ${!isActive ? 'dimmed' : ''}`}
                                            style={{
                                                backgroundColor: isActive ? seatColor : '#f0f0f0',
                                                opacity: isActive ? 1 : 0.3
                                            }}
                                            title={`Row ${seat.row}, Seat ${seat.number} - ${typeObj?.name || 'Standard'}`}
                                        >
                                            {seat.number}
                                        </div>
                                    );
                                })}
                            </div>

                            <span className="row-label">{rowNumber}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};