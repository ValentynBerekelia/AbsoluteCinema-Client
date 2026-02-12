import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { getAllUsers, searchUsers, ClientUser } from '@/api/users';
import { getUserTickets, deleteTicket, updateTicket, getSessionTickets } from '@/api/tickets';
import { getHallById } from '@/api/halls';
import { mapHallDetailsFromApi, Seat, SeatType } from '@/types/hall';
import { SeatSelection } from '@/components/SeatSelection/SeatSelection';
import { useToast } from '@/context/ToastContext/ToastContext';
import { convertIsoToDateTime } from '@/utils/dataTimeConverters';
import styles from './ClientsPage.module.css';
import { GetTicketDetailsResponse } from '@/types/ticket';

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
            const rawTickets = Array.isArray(ticketsData)
                ? ticketsData
                : Array.isArray((ticketsData as any)?.tickets)
                    ? (ticketsData as any).tickets
                    : [];

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
        <div className={styles.clientsPage}>
            <header className={styles.clientsHeader}>
                <h1>Clients Management</h1>
                <div className={styles.clientsSearchWrapper}>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.clientsSearchInput}
                    />
                </div>
            </header>

            <main className={`${styles.clientsList} ${loading ? styles.loading : ''}`}>
                {loading ? (
                    <div className={styles.clientsLoading}>Loading clients...</div>
                ) : clients.length > 0 ? (
                    <>
                        <table className={styles.clientsTable}>
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
                                            <tr className={`${styles.clientRow} ${isExpanded ? styles.expanded : ''}`}>
                                                <td className={styles.clientUsername}>
                                                    <button
                                                        className={styles.expandBtn}
                                                        onClick={() => handleExpandUser(userId)}
                                                        title={isExpanded ? 'Hide tickets' : 'View tickets'}
                                                    >
                                                        {isExpanded ? '▼' : '▶'} {client.userName || 'N/A'}
                                                    </button>
                                                </td>
                                                <td className={styles.clientEmail}>{client.email || 'N/A'}</td>
                                                <td className={styles.clientTickets}>
                                                    <span className={styles.ticketsBadge}>
                                                        {client.totalTickets || 0} tickets
                                                    </span>
                                                </td>
                                                <td className={styles.clientId} title={userId}>
                                                    {userId ? userId.substring(0, 12) : 'N/A'}...
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className={styles.ticketsRow}>
                                                    <td colSpan={4}>
                                                        <div className={styles.ticketsDetails}>
                                                            {loadingTickets ? (
                                                                <div className={styles.ticketsLoading}>Loading tickets...</div>
                                                            ) : userTickets.length > 0 ? (
                                                                    <div className={styles.ticketsGrid}>
                                                                        <div className={styles.ticketsList}>
                                                                            {userTickets.map(ticket => (
                                                                                <div key={ticket.id} className={styles.ticketItem}>
                                                                                    <div className={styles.ticketMovie}>
                                                                                        <strong>{ticket.movie?.name || ticket.session?.movieTitle || 'Movie'}</strong>
                                                                                        <span className={styles.ticketStatus}>
                                                                                            {ticket.status || 'Active'}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className={styles.ticketInfo}>
                                                                                        <span>
                                                                                            🏛️ {ticket.session?.hall?.name || 'N/A'}
                                                                                        </span>
                                                                                        <span>
                                                                                            📅 {formatSessionDate(ticket.session?.startDateTime || '')}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className={styles.ticketSeat}>
                                                                                        <span className={styles.seatInfo}>
                                                                                            Seat {ticket.seat?.row || 'N/A'}-{ticket.seat?.number || 'N/A'}
                                                                                        </span>
                                                                                        {ticket.seat?.seatType && (
                                                                                            <span className={styles.seatType}>
                                                                                                {ticket.seat.seatType.name}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    {ticket.price && (
                                                                                        <div className={styles.ticketPrice}>
                                                                                            ${ticket.price.toFixed(2)}
                                                                                        </div>
                                                                                    )}
                                                                                    <div className={styles.ticketActions}>
                                                                                        <button
                                                                                            className={styles.editTicketBtn}
                                                                                            onClick={() => handleEditTicket(ticket)}
                                                                                            title="Edit ticket"
                                                                                        >
                                                                                            ✎ Edit
                                                                                        </button>
                                                                                        <button
                                                                                            className={styles.cancelTicketBtn}
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
                                                                <div className={styles.noTickets}>No tickets for this user</div>
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

                        <div className={styles.clientsPagination}>
                            <button
                                onClick={handleBack}
                                disabled={currentPageIndex === 0}
                                className={styles.paginationBtn}
                            >
                                ← Previous
                            </button>
                            <span className={styles.paginationInfo}>
                                Page {currentPageIndex + 1} • {clients.length} clients shown
                            </span>
                            <button
                                onClick={handleNext}
                                disabled={!nextCursor}
                                className={styles.paginationBtn}
                            >
                                Next →
                            </button>
                        </div>
                    </>
                ) : (
                    <div className={styles.clientsEmpty}>
                        <p>No clients found</p>
                    </div>
                )}
            </main>

            {editingTicket && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Edit Ticket</h2>
                            <button
                                className={styles.modalClose}
                                onClick={handleCloseEditModal}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={`${styles.modalBody} ${showSeatSelector ? styles.withSeatSelector : ''}`}>
                            <div>
                                <div className={styles.modalField}>
                                    <label>Movie</label>
                                    <p className={styles.modalInfo}>{editingTicket.movie?.name || editingTicket.session?.movieTitle || 'N/A'}</p>
                                </div>
                                <div className={styles.modalField}>
                                    <label>Session Time</label>
                                    <p className={styles.modalInfo}>{formatSessionDate(editingTicket.session?.startDateTime || '')}</p>
                                </div>
                                <div className={styles.modalField}>
                                    <label>Price</label>
                                    <p className={styles.modalInfo}>${editingTicket.price?.toFixed(2) || 'N/A'}</p>
                                </div>
                                <div className={styles.modalField}>
                                    <label>Hall</label>
                                    <p className={styles.modalInfo}>{editingTicket.session?.hall?.name || 'N/A'}</p>
                                </div>
                                <div className={styles.modalField}>
                                    <label>Seat</label>
                                    <div className={styles.seatEditGroup}>
                                        <div className={styles.seatInputGroup}>
                                            <label htmlFor="seat-row">Row</label>
                                            <input
                                                id="seat-row"
                                                type="number"
                                                min="1"
                                                value={editSeatRow}
                                                onChange={(e) => setEditSeatRow(e.target.value === '' ? '' : parseInt(e.target.value))}
                                                className={styles.seatInput}
                                                placeholder="Row"
                                            />
                                        </div>
                                        <div className={styles.seatInputGroup}>
                                            <label htmlFor="seat-number">Number</label>
                                            <input
                                                id="seat-number"
                                                type="number"
                                                min="1"
                                                value={editSeatNumber}
                                                onChange={(e) => setEditSeatNumber(e.target.value === '' ? '' : parseInt(e.target.value))}
                                                className={styles.seatInput}
                                                placeholder="Seat #"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        className={styles.editSeatBtn}
                                        onClick={handleEditSeatClick}
                                        title="Select seat from hall grid"
                                    >
                                        🎯 Edit Seat
                                    </button>
                                </div>
                                <div className={styles.modalField}>
                                    <label htmlFor="status-select">Status</label>
                                    <select
                                        id="status-select"
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value)}
                                        className={styles.statusSelect}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Used">Used</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            
                            {showSeatSelector && (
                                <div className={styles.seatSelectorContainer}>
                                    <div className={styles.seatSelectorHeader}>
                                        <h3>Select a Seat</h3>
                                        <button
                                            className={styles.seatSelectorClose}
                                            onClick={() => setShowSeatSelector(false)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    {loadingHall ? (
                                        <div className={styles.seatSelectorLoading}>Loading hall layout...</div>
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
                                            <div className={styles.seatSelectorActions}>
                                                <button
                                                    className={styles.seatSelectorConfirm}
                                                    onClick={handleConfirmSeatChange}
                                                    disabled={!selectedNewSeatId}
                                                >
                                                    ✓ Confirm Seat
                                                </button>
                                                <button
                                                    className={styles.seatSelectorCancel}
                                                    onClick={() => setShowSeatSelector(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className={styles.seatSelectorError}>Failed to load hall layout</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={styles.modalFooter}>
                            <button
                                className={styles.modalCancelBtn}
                                onClick={handleCloseEditModal}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.modalSaveBtn}
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