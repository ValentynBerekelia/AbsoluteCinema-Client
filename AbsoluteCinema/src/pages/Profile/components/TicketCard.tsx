import { useState } from 'react';
import { GetTicketDetailsResponse, TicketStatus } from '@/types/Ticket';
import { deleteTicket } from '@/api/tickets';
import './TicketCard.css';

interface TicketCardProps {
    ticket: GetTicketDetailsResponse;
    isActive: boolean;
    onRefresh: () => void;
    hallSeatTypes?: Record<string, import('@/types/hall').SeatType[]>;
}

export const TicketCard = ({ ticket, isActive, onRefresh, hallSeatTypes = {} }: TicketCardProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getStatusColor = (status: string) => {
        const normalizedStatus = status.toLowerCase();
        if (normalizedStatus === 'confirmed' || normalizedStatus === TicketStatus.Confirmed.toLowerCase()) {
            return 'confirmed';
        } else if (normalizedStatus === 'pending' || normalizedStatus === TicketStatus.Pending.toLowerCase()) {
            return 'pending';
        } else if (normalizedStatus === 'used' || normalizedStatus === TicketStatus.Used.toLowerCase()) {
            return 'used';
        } else if (normalizedStatus === 'cancelled' || normalizedStatus === TicketStatus.Cancelled.toLowerCase()) {
            return 'cancelled';
        }
        return 'pending';
    };

    const handleCancelTicket = async () => {
        if (!window.confirm('Are you sure you want to cancel this ticket?')) {
            return;
        }

        try {
            setIsDeleting(true);
            await deleteTicket(ticket.id);
            onRefresh();
        } catch (error) {
            console.error('Failed to cancel ticket:', error);
            alert('Failed to cancel ticket');
        } finally {
            setIsDeleting(false);
        }
    };

    const isPast = ticket.session?.startDateTime ? new Date(ticket.session.startDateTime) < new Date() : false;

    return (
        <div className={`ticket-card ${getStatusColor(ticket.status)} ${isPast ? 'past' : ''}`}>
            <div className="ticket-header">
                <div className="ticket-status">
                    <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                    </span>
                </div>
                {isActive && !isPast && (
                    <button
                        className="cancel-button"
                        onClick={handleCancelTicket}
                        disabled={isDeleting}
                        title="Cancel this ticket"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="ticket-content">
                <div className="ticket-session-info">
                    <div className="movie-info">
                        <div className="movie-title">{ticket.movie?.name || ticket.session?.movieTitle || 'Unknown Movie'}</div>
                    </div>
                    <div className="date-time">
                        <div className="date">{formatDate(ticket.session?.startDateTime || '')}</div>
                        <div className="time">{formatTime(ticket.session?.startDateTime || '')}</div>
                    </div>

                    <div className="divider"></div>

                    <div className="hall-info">
                        <div className="label">Hall</div>
                        <div className="value">{ticket.session?.hall?.name || 'N/A'}</div>
                    </div>
                </div>

                <div className="ticket-seat-info">
                    <div className="seat-detail">
                        <span className="label">Seat</span>
                        <span className="value">
                            Row {ticket.seat?.row}, Seat {ticket.seat?.number}
                        </span>
                    </div>
                    <div className="seat-type">
                        <span className="label">Type</span>
                        <span className="value">
                            {(() => {
                                // 1) direct seatType at ticket.seatType (top-level)
                                const topDirect = (ticket as any).seatType?.name;
                                if (topDirect) return topDirect;

                                // 2) direct name nested under seat
                                const direct = ticket.seat?.seatType?.name || (ticket.seat as any)?.seatType?.name;
                                if (direct) return direct;

                                // 3) Try look up from hallSeatTypes map by hall id and seatTypeId
                                const hallId = ticket.session?.hall?.id;
                                const seatTypeId = (ticket as any).seatType?.id || (ticket.seat as any)?.seatType?.id || (ticket.seat as any)?.seatTypeId || (ticket.seat as any)?.seatTypeId?.id;
                                if (hallId && seatTypeId && (hallSeatTypes || {})[hallId]) {
                                    const found = (hallSeatTypes as any)[hallId].find((t: any) => t.id === seatTypeId || t.id === (seatTypeId?.id || seatTypeId));
                                    if (found) return found.name;
                                }

                                return 'N/A';
                            })()}
                        </span>
                    </div>
                </div>

                <div className="ticket-footer">
                    <div className="price">
                        <span className="label">Price</span>
                        <span className="value">${typeof ticket.price === 'number' ? ticket.price.toFixed(2) : 'N/A'}</span>
                    </div>
                    <div className="ticket-id">
                        <span className="label">Ticket ID</span>
                        <span className="id">{typeof ticket.id === 'string' ? ticket.id.slice(0, 8) : 'N/A'}...</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
