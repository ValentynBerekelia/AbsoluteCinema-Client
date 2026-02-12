import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { getAllUsers, searchUsers, ClientUser } from '@/api/users';
import { getUserTickets, deleteTicket, updateTicket, getSessionTickets } from '@/api/tickets';
import { getHallById } from '@/api/halls';
import { getMovieSessions } from '@/api/sessions';
import { GetTicketDetailsResponse } from '@/types/ticket';
import { mapHallDetailsFromApi, Seat, SeatType } from '@/types/hall';
import { SeatSelection } from '@/components/SeatSelection/SeatSelection';
import { useToast } from '@/context/ToastContext/ToastContext';
import { convertIsoToDateTime } from '@/utils/dataTimeConverters';
import './ClientsPage.css';

export const ClientsPage = () => {
    const { showToast } = useToast();
    const [clients, setClients] = useState<ClientUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
    const [userTickets, setUserTickets] = useState<GetTicketDetailsResponse[]>([]);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);
    const [editingTicket, setEditingTicket] = useState<GetTicketDetailsResponse | null>(null);
    const [editStatus, setEditStatus] = useState<string>('');
    const [editSeatRow, setEditSeatRow] = useState<number | string>('');
    const [editSeatNumber, setEditSeatNumber] = useState<number | string>('');
    const [showSeatSelector, setShowSeatSelector] = useState(false);
    const [hallSeats, setHallSeats] = useState<Seat[]>([]);
    const [hallTypes, setHallTypes] = useState<SeatType[]>([]);
    const [selectedNewSeatId, setSelectedNewSeatId] = useState<string | null>(null);
    const [loadingHall, setLoadingHall] = useState(false);
    const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
    
    const pageSize = 20;

    const fetchClients = useCallback(async (cursor: string | null, isNext: boolean) => {
        try {
            setLoading(true);
            const data = searchQuery 
                ? await searchUsers(searchQuery, pageSize)
                : await getAllUsers(pageSize, cursor || undefined);
            
            setClients(data?.users || []);
            setNextCursor(data?.nextCursor || null);

            if (isNext && data?.nextCursor && !cursorHistory.includes(data.nextCursor)) {
                setCursorHistory(prev => [...prev, data.nextCursor!]);
            }
        } catch (error) {
            console.error('Failed to fetch clients:', error);
            showToast('error', 'Could not load clients');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, cursorHistory, showToast]);

    useEffect(() => {
        setCursorHistory([null]);
        setCurrentPageIndex(0);
        fetchClients(null, false);
    }, [searchQuery]);

    const handleNext = () => {
        if (nextCursor) {
            const nextIdx = currentPageIndex + 1;
            setCurrentPageIndex(nextIdx);
            fetchClients(nextCursor, true);
        }
    };

    const handleBack = () => {
        if (currentPageIndex > 0) {
            const prevIdx = currentPageIndex - 1;
            const prevCursor = cursorHistory[prevIdx];
            setCurrentPageIndex(prevIdx);
            fetchClients(prevCursor, false);
        }
    };

    const fetchUserTickets = async (userId: string) => {
        try {
            setLoadingTickets(true);
            const tickets = await getUserTickets(userId);
            setUserTickets(Array.isArray(tickets) ? tickets : []);
        } catch (err) {
            console.error('Failed to fetch user tickets:', err);
            showToast('error', 'Could not load user tickets');
            setUserTickets([]);
        } finally {
            setLoadingTickets(false);
        }
    };

    const handleExpandUser = (userId: string) => {
        if (expandedUserId === userId) {
            setExpandedUserId(null);
        } else {
            setExpandedUserId(userId);
            fetchUserTickets(userId);
        }
    };

    const handleCancelTicket = async (ticketId: string) => {
        if (!window.confirm('Are you sure you want to cancel this ticket?')) return;
        
        try {
            setDeletingTicketId(ticketId);
            await deleteTicket(ticketId);
            setUserTickets(prev => prev.filter(t => t.id !== ticketId));
            showToast('success', 'Ticket cancelled successfully');
        } catch (err) {
            console.error('Failed to cancel ticket:', err);
            showToast('error', 'Failed to cancel ticket');
        } finally {
            setDeletingTicketId(null);
        }
    };

    const handleEditTicket = (ticket: GetTicketDetailsResponse) => {
        setEditingTicket({ ...ticket });
        setEditStatus(String(ticket.status));
        setEditSeatRow(ticket.seat?.row || '');
        setEditSeatNumber(ticket.seat?.number || '');
    };

    const loadHallData = async (sessionId: string, hallId: string) => {
        try {
            setLoadingHall(true);
            const [hallData, ticketsData] = await Promise.all([
                getHallById(hallId),
                getSessionTickets(sessionId)
            ]);
            
            const mapped = mapHallDetailsFromApi(hallData);
            setHallSeats(mapped.seats);
            setHallTypes(mapped.availableSeatTypes);
            
            // Extract occupied seat IDs from tickets (normalize different API shapes)
            const rawTickets = Array.isArray(ticketsData) ? ticketsData : [];

            const occupiedSeatIds = rawTickets
                .map((t: any) => String(t.seat?.id?.id ?? t.seat?.id ?? t.seatId?.id?.id ?? t.seatId ?? ''))
                .filter((id: string) => !!id);

            setOccupiedSeats(occupiedSeatIds);
        } catch (err) {
            console.error('Failed to load hall data:', err);
            showToast('error', 'Failed to load seat information');
        } finally {
            setLoadingHall(false);
        }
    };

    const handleEditSeatClick = async () => {
        if (!editingTicket?.session?.hall?.id) return;
        
        await loadHallData(editingTicket.session.id, editingTicket.session.hall.id);
        setShowSeatSelector(true);
        setSelectedNewSeatId(null);
    };

    const handleSeatSelectionChange = (selectedSeats: string[]) => {
        if (selectedSeats.length > 0) {
            const seatId = selectedSeats[0];
            const seat = hallSeats.find(s => s.seatId === seatId);
            if (seat) {
                setSelectedNewSeatId(seatId);
                setEditSeatRow(seat.row);
                setEditSeatNumber(seat.number);
            }
        }
    };

    const handleConfirmSeatChange = () => {
        if (selectedNewSeatId && editingTicket) {
            const newSeat = hallSeats.find(s => s.seatId === selectedNewSeatId);
            if (newSeat) {
                setEditingTicket({
                    ...editingTicket,
                    seat: {
                        ...editingTicket.seat,
                        row: newSeat.row,
                        number: newSeat.number
                    }
                });
                setShowSeatSelector(false);
            }
        }
    };

    const handleSaveTicket = async () => {
        if (!editingTicket) return;

        try {
            // Resolve seatId: prefer newly selected, then existing seat id, then find by row/number
            let seatIdToSend = selectedNewSeatId
                || (editingTicket.seat as any)?.id?.id
                || (editingTicket.seat as any)?.id
                || '';

            if (!seatIdToSend) {
                const resolved = hallSeats.find(s => String(s.row) === String(editSeatRow) && String(s.number) === String(editSeatNumber));
                if (resolved) seatIdToSend = resolved.seatId || '';
            }

            // Resolve userId from multiple possible shapes or fall back to expanded user context
            const userIdToSend = (editingTicket as any).userId
                || (editingTicket.user as any)?.userId
                || (editingTicket.user as any)?.id
                || (editingTicket.user as any)?.id?.id
                || expandedUserId
                || '';

            // Resolve sessionId from multiple possible shapes
            const sessionIdToSend = editingTicket.session?.id || (editingTicket.session as any)?.sessionId || (editingTicket.session as any)?.id?.id || '';

            const payload = {
                sessionId: sessionIdToSend,
                seatId: seatIdToSend,
                userId: userIdToSend
            };

            // Diagnostic toast to show which fields are present
            showToast('success', `Payload fields presence — session: ${!!payload.sessionId}, user: ${!!payload.userId}, seat: ${!!payload.seatId}`);

            // Validate payload structure
            if (!payload.sessionId || !payload.seatId || !payload.userId) {
                console.error('Missing fields for ticket update', payload, { editingTicket, selectedNewSeatId, hallSeatsLength: hallSeats.length });
                showToast('error', 'Missing sessionId, seatId or userId for ticket update');
                return;
            }

            // Debug: log payload and related state to help diagnose missing fields
            console.log('Saving ticket payload:', payload);
            console.log('editingTicket:', editingTicket);
            console.log('selectedNewSeatId:', selectedNewSeatId);
            console.log('hallSeats length:', hallSeats.length);

            // Send PATCH with required structure
            await updateTicket(editingTicket.id, payload as any);

            // Update only seat info locally (do not touch status)
            setUserTickets(prev => prev.map(t => 
                t.id === editingTicket.id ? { 
                    ...t, 
                    seat: {
                        ...t.seat,
                        row: (editSeatRow as number) || t.seat.row,
                        number: (editSeatNumber as number) || t.seat.number
                    }
                } : t
            ));

            showToast('success', 'Ticket updated successfully');
            setEditingTicket(null);
            setEditSeatRow('');
            setEditSeatNumber('');
            setSelectedNewSeatId(null);
        } catch (err) {
            console.error('Failed to update ticket:', err);
            showToast('error', 'Failed to update ticket');
        }
    };

    const handleCloseEditModal = () => {
        setEditingTicket(null);
        setEditStatus('');
        setEditSeatRow('');
        setEditSeatNumber('');
        setShowSeatSelector(false);
        setSelectedNewSeatId(null);
        setHallSeats([]);
        setHallTypes([]);
        setOccupiedSeats([]);
    };

    const formatSessionDate = (dateTime: string) => {
        if (!dateTime) return '';
        const { date, time } = convertIsoToDateTime(dateTime);
        return `${date}, ${time}`;
    }

    return (
        <div className="clients-page">
            <header className="clients-header">
                <h1>Clients Management</h1>
                <div className="clients-search-wrapper">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="clients-search-input"
                    />
                </div>
            </header>

            <main className={`clients-list ${loading ? 'loading' : ''}`}>
                {loading ? (
                    <div className="clients-loading">Loading clients...</div>
                ) : clients.length > 0 ? (
                    <>
                        <table className="clients-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Total Tickets</th>
                                    <th>User ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(clients) && clients.length > 0 && clients.map(client => {
                                    const userId = client.userId || client.id || '';
                                    const isExpanded = expandedUserId === userId;
                                    return (
                                        <React.Fragment key={userId}>
                                            <tr className={`client-row ${isExpanded ? 'expanded' : ''}`}>
                                                <td className="client-username">
                                                    <button
                                                        className="expand-btn"
                                                        onClick={() => handleExpandUser(userId)}
                                                        title={isExpanded ? 'Hide tickets' : 'View tickets'}
                                                    >
                                                        {isExpanded ? '▼' : '▶'} {client.userName || 'N/A'}
                                                    </button>
                                                </td>
                                                <td className="client-email">{client.email || 'N/A'}</td>
                                                <td className="client-tickets">
                                                    <span className="tickets-badge">
                                                        {client.totalTickets || 0} tickets
                                                    </span>
                                                </td>
                                                <td className="client-id" title={userId}>
                                                    {userId ? userId.substring(0, 12) : 'N/A'}...
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="tickets-row">
                                                    <td colSpan={4}>
                                                        <div className="tickets-details">
                                                            {loadingTickets ? (
                                                                <div className="tickets-loading">Loading tickets...</div>
                                                            ) : userTickets.length > 0 ? (
                                                                    <div className="tickets-grid">
                                                                        <div className="tickets-list">
                                                                            {userTickets.map(ticket => (
                                                                                <div key={ticket.id} className="ticket-item">
                                                                                    <div className="ticket-movie">
                                                                                        <strong>{ticket.movie?.name || ticket.session?.movieTitle || 'Movie'}</strong>
                                                                                        <span className="ticket-status">
                                                                                            {ticket.status || 'Active'}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="ticket-info">
                                                                                        <span>
                                                                                            🏛️ {ticket.session?.hall?.name || 'N/A'}
                                                                                        </span>
                                                                                        <span>
                                                                                            📅 {formatSessionDate(ticket.session?.startDateTime || '')}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="ticket-seat">
                                                                                        <span className="seat-info">
                                                                                            Seat {ticket.seat?.row || 'N/A'}-{ticket.seat?.number || 'N/A'}
                                                                                        </span>
                                                                                        {ticket.seat?.seatType && (
                                                                                            <span className="seat-type">
                                                                                                {ticket.seat.seatType.name}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    {ticket.price && (
                                                                                        <div className="ticket-price">
                                                                                            ${ticket.price.toFixed(2)}
                                                                                        </div>
                                                                                    )}
                                                                                    <div className="ticket-actions">
                                                                                        <button
                                                                                            className="edit-ticket-btn"
                                                                                            onClick={() => handleEditTicket(ticket)}
                                                                                            title="Edit ticket"
                                                                                        >
                                                                                            ✎ Edit
                                                                                        </button>
                                                                                        <button
                                                                                            className="cancel-ticket-btn"
                                                                                            onClick={() => handleCancelTicket(ticket.id)}
                                                                                            disabled={deletingTicketId === ticket.id}
                                                                                        >
                                                                                            {deletingTicketId === ticket.id ? '...' : '✕ Cancel'}
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                            ) : (
                                                                <div className="no-tickets">No tickets for this user</div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="clients-pagination">
                            <button
                                onClick={handleBack}
                                disabled={currentPageIndex === 0}
                                className="pagination-btn"
                            >
                                ← Previous
                            </button>
                            <span className="pagination-info">
                                Page {currentPageIndex + 1} • {clients.length} clients shown
                            </span>
                            <button
                                onClick={handleNext}
                                disabled={!nextCursor}
                                className="pagination-btn"
                            >
                                Next →
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="clients-empty">
                        <p>No clients found</p>
                    </div>
                )}
            </main>

            {editingTicket && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Edit Ticket</h2>
                            <button
                                className="modal-close"
                                onClick={handleCloseEditModal}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={`modal-body ${showSeatSelector ? 'with-seat-selector' : ''}`}>
                            <div>
                                <div className="modal-field">
                                    <label>Movie</label>
                                    <p className="modal-info">{editingTicket.movie?.name || editingTicket.session?.movieTitle || 'N/A'}</p>
                                </div>
                                <div className="modal-field">
                                    <label>Session Time</label>
                                    <p className="modal-info">{formatSessionDate(editingTicket.session?.startDateTime || '')}</p>
                                </div>
                                <div className="modal-field">
                                    <label>Price</label>
                                    <p className="modal-info">${editingTicket.price?.toFixed(2) || 'N/A'}</p>
                                </div>
                                <div className="modal-field">
                                    <label>Hall</label>
                                    <p className="modal-info">{editingTicket.session?.hall?.name || 'N/A'}</p>
                                </div>
                                <div className="modal-field">
                                    <label>Seat</label>
                                    <div className="seat-edit-group">
                                        <div className="seat-input-group">
                                            <label htmlFor="seat-row">Row</label>
                                            <input
                                                id="seat-row"
                                                type="number"
                                                min="1"
                                                value={editSeatRow}
                                                onChange={(e) => setEditSeatRow(e.target.value === '' ? '' : parseInt(e.target.value))}
                                                className="seat-input"
                                                placeholder="Row"
                                            />
                                        </div>
                                        <div className="seat-input-group">
                                            <label htmlFor="seat-number">Number</label>
                                            <input
                                                id="seat-number"
                                                type="number"
                                                min="1"
                                                value={editSeatNumber}
                                                onChange={(e) => setEditSeatNumber(e.target.value === '' ? '' : parseInt(e.target.value))}
                                                className="seat-input"
                                                placeholder="Seat #"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        className="edit-seat-btn"
                                        onClick={handleEditSeatClick}
                                        title="Select seat from hall grid"
                                    >
                                        🎯 Edit Seat
                                    </button>
                                </div>
                                <div className="modal-field">
                                    <label htmlFor="status-select">Status</label>
                                    <select
                                        id="status-select"
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Used">Used</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            
                            {showSeatSelector && (
                                <div className="seat-selector-container">
                                    <div className="seat-selector-header">
                                        <h3>Select a Seat</h3>
                                        <button
                                            className="seat-selector-close"
                                            onClick={() => setShowSeatSelector(false)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    {loadingHall ? (
                                        <div className="seat-selector-loading">Loading hall layout...</div>
                                    ) : hallSeats.length > 0 ? (
                                        <>
                                            <SeatSelection
                                                seats={hallSeats}
                                                seatTypes={hallTypes}
                                                occupiedSeats={occupiedSeats}
                                                onSelectionChange={handleSeatSelectionChange}
                                                showSummary={false}
                                                singleSelect={true}
                                            />
                                            <div className="seat-selector-actions">
                                                <button
                                                    className="seat-selector-confirm"
                                                    onClick={handleConfirmSeatChange}
                                                    disabled={!selectedNewSeatId}
                                                >
                                                    ✓ Confirm Seat
                                                </button>
                                                <button
                                                    className="seat-selector-cancel"
                                                    onClick={() => setShowSeatSelector(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="seat-selector-error">Failed to load hall layout</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="modal-cancel-btn"
                                onClick={handleCloseEditModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="modal-save-btn"
                                onClick={handleSaveTicket}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
