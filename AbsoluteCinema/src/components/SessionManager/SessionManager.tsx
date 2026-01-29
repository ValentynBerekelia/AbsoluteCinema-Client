import React from 'react';
import './SessionManager.css'
import { Hall, SeatType } from '@/types/hall';
import { getMaxSeatsInRow } from '@/utils/getMaxSeatsInRow';

export interface SessionFormData {
    id: string;
    dateFrom: string;
    dateTo: string;
    time: string;
    hall: string;
    averagePrice: string;
    first3RowPrice: string;
    vipPrice: string;
}

interface SessionManagerProps {
    sessions: SessionFormData[];
    halls: Hall[];
    seatTypes: SeatType[];
    onAddSession: () => void;
    onRemoveSession: (id: string) => void;
    onSessionChange: (id: string, field: keyof SessionFormData, value: string) => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
    sessions,
    halls,
    onAddSession,
    onRemoveSession,
    onSessionChange,
}) => {
    return (
        <div className="form-section sessions-section">
            <h3>Sessions & Pricing</h3>

            {sessions.map((session, index) => {
                const selectedHall = halls.find(h => h.id === session.hall);
                const maxColumns = selectedHall ? getMaxSeatsInRow(selectedHall.seats) : 10;
                return (
                    <div key={session.id} className="session-card">
                        <div className="session-header">
                            <h4>Session {index + 1}</h4>
                            {sessions.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => onRemoveSession(session.id)}
                                    className="remove-session-btn"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <div className="session-dates">
                            <div className="form-group">
                                <label>From [date range]</label>
                                <input
                                    type="date"
                                    value={session.dateFrom}
                                    onChange={(e) => onSessionChange(session.id, 'dateFrom', e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>to [date range]</label>
                                <input
                                    type="date"
                                    value={session.dateTo}
                                    onChange={(e) => onSessionChange(session.id, 'dateTo', e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Time</label>
                                <input
                                    type="time"
                                    value={session.time}
                                    onChange={(e) => onSessionChange(session.id, 'time', e.target.value)}
                                    className="form-input time-input"
                                />
                            </div>
                        </div>

                        <div className="hall-selector">
                            <label>Hall:</label>
                            <select
                                value={session.hall}
                                onChange={(e) => onSessionChange(session.id, 'hall', e.target.value)}
                                className="form-input hall-select"
                            >
                                <option value="">Select Hall</option>
                                {halls.map(hall => (
                                    <option key={hall.id} value={hall.id}>{hall.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Візуалізація сітки місць */}
                        <div 
                            className="seats-grid"
                            style={{
                                gridTemplateColumns: `repeat(${maxColumns}, 28px)`
                            }}
                        >
                            {selectedHall ? (
                                selectedHall.seats.map((seat, i) => (
                                    <div
                                        key={i}
                                        className={`seat-placeholder ${seat.seatTypeId === '981d38ca-47b5-446b-bc9f-9bee14c1464b' ? 'vip' :
                                            seat.seatTypeId === '5b34194d-93a3-4ec1-b3d5-c3155e94ef30' ? 'comfort' : ''
                                            }`}
                                        style={{ gridColumn: seat.number, gridRow: seat.row }}
                                        title={`Row: ${seat.row}, Num: ${seat.number}`}
                                    ></div>
                                ))
                            ) : (
                                Array.from({ length: 60 }).map((_, i) => (
                                    <div key={i} className='seat-placeholder-empty'></div>
                                ))
                            )}
                        </div>

                        <div className="ticket-prices">
                            <h5>Ticket prices</h5>
                            <div className="prices-row">
                                <div className="form-group">
                                    <label>Average:</label>
                                    <input
                                        type="number"
                                        value={session.averagePrice}
                                        onChange={(e) => onSessionChange(session.id, 'averagePrice', e.target.value)}
                                        className="form-input price-input"
                                        placeholder="Price"
                                        step="0.01"
                                    />
                                </div>
                                <div className="form-group checkbox-group">
                                    <input type="checkbox" id={`first3-${session.id}`} />
                                    <label htmlFor={`first3-${session.id}`}>First 3 row:</label>
                                    <input
                                        type="number"
                                        value={session.first3RowPrice}
                                        onChange={(e) => onSessionChange(session.id, 'first3RowPrice', e.target.value)}
                                        className="form-input price-input"
                                        placeholder="Price"
                                        step="0.01"
                                    />
                                </div>
                                <div className="form-group checkbox-group">
                                    <input type="checkbox" id={`vip-${session.id}`} />
                                    <label htmlFor={`vip-${session.id}`}>VIP:</label>
                                    <input
                                        type="number"
                                        value={session.vipPrice}
                                        onChange={(e) => onSessionChange(session.id, 'vipPrice', e.target.value)}
                                        className="form-input price-input"
                                        placeholder="Price"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="button" className="save-session-btn">
                            Save sessions and price
                        </button>
                    </div>
                );
            })}

            <button type="button" onClick={onAddSession} className="add-session-btn">
                +
            </button>
        </div>
    );
};