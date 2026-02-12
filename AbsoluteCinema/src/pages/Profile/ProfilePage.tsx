import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext/AuthContext';
import { getUserTickets } from '@/api/tickets';
import { getHallById } from '@/api/halls';
import { mapHallDetailsFromApi, SeatType } from '@/types/hall';
import { UserInfoCard, ActiveTickets, TicketHistory } from './components';
import './ProfilePage.css';
import { GetTicketDetailsResponse, TicketStatus } from '@/types/ticket';

export const ProfilePage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<GetTicketDetailsResponse[]>([]);
    const [ticketsLoading, setTicketsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'tickets' | 'history'>('tickets');
    const [hallSeatTypes, setHallSeatTypes] = useState<Record<string, SeatType[]>>({});

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
            return;
        }

        if (user?.userId) {
            fetchUserTickets();
        }
    }, [user, loading, navigate]);

    const fetchUserTickets = async () => {
        try {
            setTicketsLoading(true);
            const data = await getUserTickets(user!.userId);
            const ticketsData = data || [];
            setTickets(ticketsData);

            // Fetch hall seat types for unique halls in tickets
            const hallIds = Array.from(new Set(ticketsData.map((t: any) => t.session?.hall?.id).filter(Boolean)));
            const typesMap: Record<string, SeatType[]> = {};
            await Promise.all(hallIds.map(async (hid: string) => {
                try {
                    const hallRes = await getHallById(hid);
                    const mapped = mapHallDetailsFromApi(hallRes);
                    typesMap[hid] = mapped.availableSeatTypes || [];
                } catch (err) {
                    typesMap[hid] = [];
                }
            }));
            setHallSeatTypes(typesMap);
        } catch (error) {
            console.error('Failed to fetch user tickets:', error);
            setTickets([]);
        } finally {
            setTicketsLoading(false);
        }
    };

    if (loading) {
        return <div className="profile-loading">Loading...</div>;
    }

    if (!user) {
        return null;
    }

    const now = new Date();

    // Tickets for sessions that already happened should be in Purchase History
    const ticketHistory = tickets.filter(ticket => {
        const sessionTime = ticket.session?.startDateTime ? new Date(ticket.session.startDateTime) : null;
        if (sessionTime && sessionTime < now) return true;
        // Also include cancelled or used statuses regardless of time
        return ticket.status === TicketStatus.Cancelled || ticket.status === 'Cancelled';
    });

    const activeTickets = tickets.filter(ticket => !ticketHistory.includes(ticket));

    return (
        <div className="profile-page">
            <div className="profile-container">
                <UserInfoCard user={user} onRefresh={fetchUserTickets} />

                <div className="profile-tabs">
                    <button
                        className={`tab-button ${activeTab === 'tickets' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tickets')}
                    >
                        Active Tickets ({activeTickets.length})
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Purchase History ({ticketHistory.length})
                    </button>
                </div>

                <div className="profile-content">
                    {ticketsLoading ? (
                        <div className="loading">Loading tickets...</div>
                    ) : (
                        <>
                            {activeTab === 'tickets' && (
                                <ActiveTickets
                                    tickets={activeTickets}
                                    onRefresh={fetchUserTickets}
                                    hallSeatTypes={hallSeatTypes}
                                />
                            )}
                            {activeTab === 'history' && (
                                <TicketHistory tickets={ticketHistory} hallSeatTypes={hallSeatTypes} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
