import React from 'react';
import './SessionManager.css'
import { Hall, SeatType } from '@/types/hall';
import { HallGrid } from '../HallGrid/HallGrid';
import { TicketPriceManager } from '../TicketPriceManager/TicketPriceManager';

export interface SessionFormData {
    id: string;
    dateFrom: string;
    dateTo: string;
    time: string;
    hall: string;
    seatPrices: Record<string, string>;
    enabledTypes: Record<string, boolean>;
}

interface SessionManagerProps {
    sessions: SessionFormData[];
    halls: Hall[];
    seatTypes: SeatType[];
    loadingHalls: Record<string, boolean>
    onAddSession: () => void;
    onRemoveSession: (id: string) => void;
    onSessionChange: (id: string, field: keyof SessionFormData, value: any) => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
    sessions,
    halls,
    seatTypes,
    loadingHalls,
    onAddSession,
    onRemoveSession,
    onSessionChange,
}) => {
    return (
        <div className="form-section sessions-section">
            <h3>Sessions & Pricing</h3>

            {sessions.map((session, index) => {
                const selectedHall = halls.find(h => h.id === session.hall);
                const isLoading = session.hall ? loadingHalls[session.hall] : false;

                const hasData = selectedHall && selectedHall.seats && selectedHall.seats.length > 0;
                const hallSeatTypes = selectedHall?.availableSeatTypes ?? [];

                return (
                    <div key={session.id} className="session-card">
                        <div className="session-header">
                            <h4>Session {index + 1}</h4>
                            {sessions.length > 1 && (
                                <button type="button" onClick={() => onRemoveSession(session.id)} className="remove-session-btn">✕</button>
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

                        <div className="hall-status-container">
                            {isLoading ? (
                                <div className="hall-loader">
                                    <div className="spinner"></div>
                                    <span>Loading schemas {selectedHall?.name}...</span>
                                </div>
                            ) : hasData ? (
                                <HallGrid
                                    seats={selectedHall.seats}
                                    seatTypes={selectedHall.availableSeatTypes ?? []}
                                    enabledTypes={session.enabledTypes}
                                />
                            ) : session.hall ? (
                                <div className="hall-error">Error while loading data</div>
                            ) : (
                                <div className="hall-placeholder">Choose the hall to watch schema </div>
                            )}
                        </div>

                        <TicketPriceManager
                            sessionId={session.id}
                            seatTypes={hallSeatTypes}
                            enabledTypes={session.enabledTypes}
                            seatPrices={session.seatPrices}
                            onPriceChange={(typeId, field, value) => {
                                const subField = field === 'enabled' ? 'enabledTypes' : 'seatPrices';
                                onSessionChange(session.id, subField, {
                                    ...session[subField],
                                    [typeId]: value
                                });
                            }}
                        />

                        <button type="button" className="save-session-btn">Save sessions and price</button>
                    </div>
                );
            })}

            <button type="button" onClick={onAddSession} className="add-session-btn">+</button>
        </div>
    );
};