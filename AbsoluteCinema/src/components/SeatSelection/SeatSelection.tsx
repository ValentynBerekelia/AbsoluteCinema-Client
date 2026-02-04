import { useState, useEffect } from 'react';
import { Seat, SeatType } from '@/types/hall';
import { getMaxSeatsInRow } from '@/utils/getMaxSeatsInRow';
import './SeatSelection.css';

interface SeatWithStatus extends Seat {
    isOccupied?: boolean;
    isSelected?: boolean;
}

interface SeatSelectionProps {
    seats: Seat[];
    seatTypes: SeatType[];
    occupiedSeats?: string[];
    onSelectionChange: (selectedSeats: string[]) => void;
    prices?: Record<string, number>;
    showSummary?: boolean;
}

export const SeatSelection = ({ 
    seats, 
    seatTypes, 
    occupiedSeats = [], 
    onSelectionChange,
    prices = {},
    showSummary = true
}: SeatSelectionProps) => {
    const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
    const maxSeatsInRow = getMaxSeatsInRow(seats);
    const typeColors = seatTypes.reduce((acc, type, index) => {
        const name = type.name.toLowerCase();
        if (name.includes('stand') || name.includes('standard')) acc[type.id] = '#4caf50';
        else if (name.includes('vip')) acc[type.id] = '#f4c430';
        else if (name.includes('comfort')) acc[type.id] = '#2196f3';
        else if (name.includes('premium')) acc[type.id] = '#9c27b0';
        else if (name.includes('lux')) acc[type.id] = '#ff5722';
        else {
            const palette = ['#00bcd4', '#8bc34a', '#795548', '#e91e63', '#607d8b'];
            acc[type.id] = palette[index % palette.length];
        }
        return acc;
    }, {} as Record<string, string>);

    const seatsWithStatus: SeatWithStatus[] = seats.map(seat => ({
        ...seat,
        isOccupied: occupiedSeats.includes(seat.seatId || ''),
        isSelected: selectedSeats.has(seat.seatId || '')
    }));

    const handleSeatClick = (seat: SeatWithStatus) => {
        if (seat.isOccupied || !seat.seatId) return;

        const newSelection = new Set(selectedSeats);
        if (newSelection.has(seat.seatId)) {
            newSelection.delete(seat.seatId);
        } else {
            newSelection.add(seat.seatId);
        }
        setSelectedSeats(newSelection);
        onSelectionChange(Array.from(newSelection));
    };

    const getSeatTypeName = (seatTypeId: string) => {
        return seatTypes.find(t => t.id === seatTypeId)?.name || 'Standard';
    };

    const getSeatPrice = (seatTypeId: string) => {
        return prices[seatTypeId] || 0;
    };

    const getSeatTypeColor = (seatTypeId: string) => {
        return typeColors[seatTypeId] || '#4caf50';
    };

    const groupedByRow = seatsWithStatus.reduce((acc, seat) => {
        if (!acc[seat.row]) {
            acc[seat.row] = [];
        }
        acc[seat.row].push(seat);
        return acc;
    }, {} as Record<number, SeatWithStatus[]>);

    const rows = Object.keys(groupedByRow)
        .map(Number)
        .sort((a, b) => a - b);

    const totalPrice = Array.from(selectedSeats).reduce((sum, seatId) => {
        const seat = seats.find(s => s.seatId === seatId);
        if (seat) {
            return sum + getSeatPrice(seat.seatTypeId);
        }
        return sum;
    }, 0);

    return (
        <div className="seat-selection">
            <div className="seat-selection__screen">
                <div className="screen-label">SCREEN</div>
            </div>

            <div className="seat-selection__hall">
                {rows.map(rowNumber => {
                    const rowSeats = groupedByRow[rowNumber].sort((a, b) => a.number - b.number);
                    const rowSeatNumbers = rowSeats.map(seat => seat.number);
                    const rowMinSeat = Math.min(...rowSeatNumbers);
                    const rowMaxSeat = Math.max(...rowSeatNumbers);
                    const rowWidth = rowMaxSeat - rowMinSeat + 1;
                    const offset = Math.floor((maxSeatsInRow - rowWidth) / 2);
                    return (
                        <div 
                            key={rowNumber} 
                            className="seat-row"
                        >
                            <span className="row-label">{rowNumber}</span>
                            <div
                                className="seat-row__grid"
                                style={{ gridTemplateColumns: `repeat(${maxSeatsInRow}, 1fr)` }}
                            >
                                {rowSeats.map(seat => {
                                    const seatClass = [
                                        'seat',
                                        seat.isOccupied ? 'seat--occupied' : '',
                                        seat.isSelected ? 'seat--selected' : '',
                                        !seat.isOccupied && !seat.isSelected ? 'seat--available' : ''
                                    ].filter(Boolean).join(' ');

                                    const baseColor = getSeatTypeColor(seat.seatTypeId);
                                    const seatStyle: React.CSSProperties = {
                                        gridColumn: offset + (seat.number - rowMinSeat) + 1,
                                        background: seat.isOccupied ? undefined : seat.isSelected ? '#1e88e5' : baseColor,
                                        borderColor: seat.isOccupied ? undefined : baseColor
                                    };

                                    return (
                                        <button
                                            key={`${seat.row}-${seat.number}`}
                                            className={seatClass}
                                            onClick={() => handleSeatClick(seat)}
                                            disabled={seat.isOccupied}
                                            title={`Row ${seat.row}, Seat ${seat.number} - ${getSeatTypeName(seat.seatTypeId)} ($${getSeatPrice(seat.seatTypeId).toFixed(2)})`}
                                            style={seatStyle}
                                        >
                                            {seat.number}
                                        </button>
                                    );
                                })}
                            </div>
                            <span className="row-label row-label--right">{rowNumber}</span>
                        </div>
                    );
                })}
            </div>

            <div className="seat-selection__legend">
                <div className="legend-group">
                    <span className="legend-title">Status</span>
                    <div className="legend-item">
                        <div className="legend-seat legend-seat--available"></div>
                        <span>Available</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-seat legend-seat--selected"></div>
                        <span>Selected</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-seat legend-seat--occupied"></div>
                        <span>Occupied</span>
                    </div>
                </div>
                <div className="legend-group">
                    <span className="legend-title">Seat types</span>
                    {seatTypes.map(type => (
                        <div key={type.id} className="legend-item">
                            <div
                                className="legend-seat"
                                style={{ background: getSeatTypeColor(type.id), borderColor: getSeatTypeColor(type.id) }}
                            ></div>
                            <span>{type.name}</span>
                            <span className="legend-price">
                                {prices[type.id] != null ? `$${Number(prices[type.id]).toFixed(2)}` : '—'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {showSummary && (
                <div className="seat-selection__summary">
                    <div className="summary-info">
                        <span className="summary-label">Selected seats:</span>
                        <span className="summary-value">{selectedSeats.size}</span>
                    </div>
                    <div className="summary-info">
                        <span className="summary-label">Total price:</span>
                        <span className="summary-value">${totalPrice.toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

