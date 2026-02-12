import { useState } from 'react';
import { Seat, SeatType } from '@/types/hall';
import { getMaxSeatsInRow } from '@/utils/getMaxSeatsInRow';
import { getDynamicSeatColor } from '@/utils/colorGenerator'; // Твій генератор
import './SeatSelection.css';

interface SeatSelectionProps {
    seats: Seat[];
    seatTypes: SeatType[];
    occupiedSeats?: string[];
    onSelectionChange: (selectedSeats: string[]) => void;
    prices?: Record<string, number>;
    showSummary?: boolean;
    singleSelect?: boolean;
}

export const SeatSelection = ({ 
    seats, 
    seatTypes, 
    occupiedSeats = [], 
    onSelectionChange,
    prices = {},
    showSummary = true,
    singleSelect = false
}: SeatSelectionProps) => {
    const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());

    const handleSeatClick = (seatId: string, isOccupied: boolean) => {
        if (isOccupied || !seatId) return;
        const newSelection = new Set<string>();
        if (singleSelect) {
            newSelection.add(seatId);
        } else {
            // toggle
            selectedSeats.forEach(s => newSelection.add(s));
            if (newSelection.has(seatId)) newSelection.delete(seatId);
            else newSelection.add(seatId);
        }

        setSelectedSeats(newSelection);
        onSelectionChange(Array.from(newSelection));
    };

    const groupedByRow = seats.reduce((acc, seat) => {
        if (!acc[seat.row]) acc[seat.row] = [];
        acc[seat.row].push(seat);
        return acc;
    }, {} as Record<number, Seat[]>);

    const rows = Object.keys(groupedByRow).map(Number).sort((a, b) => a - b);

    const totalPrice = Array.from(selectedSeats).reduce((sum, seatId) => {
        const seat = seats.find(s => s.seatId === seatId);
        return sum + (prices[seat?.seatTypeId || ''] || 0);
    }, 0);

    return (
        <div className="seat-selection">
            <div className="seat-selection__screen">
                <div className="screen-label">SCREEN</div>
            </div>

            <div className="seat-selection__hall">
                {rows.map(rowNumber => {
                    const rowSeats = groupedByRow[rowNumber].sort((a, b) => a.number - b.number);
                    
                    return (
                        <div key={rowNumber} className="seat-row">
                            <span className="row-label">{rowNumber}</span>
                            
                            <div className="seat-row__flex-container">
                                {rowSeats.map(seat => {
                                    const isOccupied = occupiedSeats.includes(seat.seatId || '');
                                    const isSelected = selectedSeats.has(seat.seatId || '');
                                    const typeObj = seatTypes.find(t => t.id === seat.seatTypeId);
                                    const baseColor = getDynamicSeatColor(typeObj?.name || 'standard');

                                    return (
                                        <button
                                            key={seat.seatId}
                                            className={`seat ${isOccupied ? 'seat--occupied' : isSelected ? 'seat--selected' : ''}`}
                                            onClick={() => handleSeatClick(seat.seatId!, isOccupied)}
                                            disabled={isOccupied}
                                            style={{ 
                                                backgroundColor: isOccupied ? '#f0f0f0' : baseColor,
                                            }}
                                            title={`Row ${seat.row}, Seat ${seat.number} - ${typeObj?.name || 'Standard'}`}
                                        >
                                            {!isOccupied ? seat.number : ''}
                                        </button>
                                    );
                                })}
                            </div>

                            <span className="row-label">{rowNumber}</span>
                        </div>
                    );
                })}
            </div>

            <div className="seat-selection__legend">
                <div className="legend-group">
                    <span className="legend-title">Status</span>
                    <div className="legend-item">
                        <div className="legend-seat" style={{boxShadow: '0 0 0 2px white, 0 0 0 4px #2196f3', background: '#2196f3'}}></div>
                        <span>Selected</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-seat" style={{background: '#f0f0f0', opacity: 0.6}}></div>
                        <span>Occupied</span>
                    </div>
                </div>
                <div className="legend-group">
                    <span className="legend-title">Seat types</span>
                    {seatTypes.map(type => (
                        <div key={type.id} className="legend-item">
                            <div className="legend-seat" style={{ background: getDynamicSeatColor(type.name) }}></div>
                            <span>{type.name}</span>
                            <span className="legend-price">${(prices[type.id] || 0).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {showSummary && (
                <div className="seat-selection__summary">
                    <div className="summary-info">
                        <span>Selected: <strong>{selectedSeats.size}</strong></span>
                        <span>Total: <strong>${totalPrice.toFixed(2)}</strong></span>
                    </div>
                </div>
            )}
        </div>
    );
};