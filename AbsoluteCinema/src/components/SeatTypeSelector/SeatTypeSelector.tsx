import React from 'react';
import './SeatTypeSelector.css';

export type SeatType = 'comfort' | 'vip' | 'standart' | 'broken' | 'disabled';

const SEAT_TYPES: SeatType[] = ['comfort', 'vip', 'standart', 'broken', 'disabled'];

const SEAT_TYPE_COLORS: Record<SeatType, string> = {
    'comfort': '#4CAF50',
    'vip': '#FFD700',
    'standart': '#90CAF9',
    'broken': '#B0BEC5',
    'disabled': '#999999'
};

const SEAT_TYPE_LABELS: Record<SeatType, string> = {
    'comfort': 'Комфорт',
    'vip': 'VIP',
    'standart': 'Стандарт',
    'broken': 'Зламане',
    'disabled': 'Для інвалідів'
};

interface Props {
    seatsCount?: number;
}

export const SeatTypeSelector = ({ seatsCount = 60 }: Props) => {
    // TODO: Буде реалізовано механіка вибору типу сидінь по кліку пізніше
    
    return (
        <div className="seat-type-selector">
            <div className="selector-header">
                <h4>Гріда сидінь</h4>
            </div>

            <div className="seat-type-legend">
                <h5>Типи сидінь</h5>
                <div className="legend-items">
                    {SEAT_TYPES.map(type => (
                        <div key={type} className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: SEAT_TYPE_COLORS[type] }}></span>
                            <span className="legend-label">{SEAT_TYPE_LABELS[type]}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="seats-grid">
                {Array.from({ length: seatsCount }).map((_, i) => (
                    <div key={i} className="seat" title={`Сидіння ${i + 1}`}></div>
                ))}
            </div>
        </div>
    );
};
