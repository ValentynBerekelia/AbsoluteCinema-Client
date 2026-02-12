import { GetTicketDetailsResponse } from '@/types/Ticket';
import { TicketCard } from './TicketCard';
import './ActiveTickets.css';

interface ActiveTicketsProps {
    tickets: GetTicketDetailsResponse[];
    onRefresh: () => void;
    hallSeatTypes?: Record<string, import('@/types/hall').SeatType[]>;
}

export const ActiveTickets = ({ tickets, onRefresh, hallSeatTypes = {} }: ActiveTicketsProps) => {
    if (tickets.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">🎫</div>
                <h2>No Active Tickets</h2>
                <p>You don't have any active tickets at the moment.</p>
                <p>Let's go and book some tickets!</p>
            </div>
        );
    }

    return (
        <div className="tickets-container">
            <div className="tickets-grid">
                {tickets.map(ticket => (
                    <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        isActive={true}
                        onRefresh={onRefresh}
                        hallSeatTypes={hallSeatTypes}
                    />
                ))}
            </div>
        </div>
    );
};
