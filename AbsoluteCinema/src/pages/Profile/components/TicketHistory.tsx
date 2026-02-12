import { GetTicketDetailsResponse } from '@/types/Ticket';
import { TicketCard } from './TicketCard';
import './TicketHistory.css';

interface TicketHistoryProps {
    tickets: GetTicketDetailsResponse[];
    hallSeatTypes?: Record<string, import('@/types/hall').SeatType[]>;
}

export const TicketHistory = ({ tickets, hallSeatTypes = {} }: TicketHistoryProps) => {
    if (tickets.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h2>No History</h2>
                <p>Your purchase history will appear here.</p>
            </div>
        );
    }

    // Sort by date, newest first
    const sortedTickets = [...tickets].sort((a, b) => {
        const dateA = a.session?.startDateTime ? new Date(a.session.startDateTime).getTime() : 0;
        const dateB = b.session?.startDateTime ? new Date(b.session.startDateTime).getTime() : 0;
        return dateB - dateA;
    });

    return (
        <div className="history-container">
            <div className="history-list">
                {sortedTickets.map(ticket => (
                    <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        isActive={false}
                        onRefresh={() => {}}
                        hallSeatTypes={hallSeatTypes}
                    />
                ))}
            </div>
        </div>
    );
};
