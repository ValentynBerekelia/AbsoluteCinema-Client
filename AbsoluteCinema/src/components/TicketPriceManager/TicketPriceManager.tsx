import React from 'react';
import { SeatType } from '@/types/hall';
import './TicketPriceManager.css'

interface TicketPriceManagerProps {
    sessionId: string;
    seatTypes: SeatType[];
    enabledTypes: Record<string, boolean>;
    seatPrices: Record<string, string>;
    onPriceChange: (typeId: string, field: 'enabled' | 'price', value: any) => void;
}

export const TicketPriceManager: React.FC<TicketPriceManagerProps> = ({
    sessionId,
    seatTypes,
    enabledTypes,
    seatPrices,
    onPriceChange,
}) => {
    return (
        <div className="ticket-prices">
            <h5>Ticket prices</h5>
            <div className="prices-row">
                {seatTypes.map((type) => {
                    const isEnabled = enabledTypes[type.id] || false;
                    
                    return (
                        <div key={type.id} className="price-option-container">
                            <div className="checkbox-group">
                                <input 
                                    type="checkbox" 
                                    id={`price-${sessionId}-${type.id}`}
                                    checked={isEnabled}
                                    onChange={(e) => onPriceChange(type.id, 'enabled', e.target.checked)}
                                />
                                <label htmlFor={`price-${sessionId}-${type.id}`}>
                                    {type.name}:
                                </label>
                            </div>
                            <input
                                type="number"
                                placeholder="Price"
                                className="form-input price-input"
                                value={seatPrices[type.id] || ''}
                                disabled={!isEnabled}
                                onChange={(e) => onPriceChange(type.id, 'price', e.target.value)}
                                step="0.01"
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};