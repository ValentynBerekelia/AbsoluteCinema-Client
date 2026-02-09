import { useNavigate } from 'react-router-dom';
import { MovieAdminCardInfo } from '../../types/Movie';
import { TimeBadge } from '../ui/TimeBadge/TimeBadge';
import './AdminMovieCard.css';
import { useEffect, useMemo, useState } from 'react';
import { getHallById } from '@/api';
import { getSessionTickets } from '@/api/tickets';

interface AdminMovieCardProps {
    movie: MovieAdminCardInfo;
    onDelete: (id: string) => void;
}

export const AdminMovieCard = ({ movie, onDelete }: AdminMovieCardProps) => {
    const navigate = useNavigate();
    const [totalTickets, setTotalTickets] = useState(0);
    const [totalSeats, setTotalSeats] = useState(0);

    const groupedSessions = movie.sessions.reduce((acc, session) => {
        const date = session.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(session);
        return acc;
    }, {} as Record<string, typeof movie.sessions>);

    const sortedDates = Object.keys(groupedSessions).sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime();
    });

    // Fetch sales data
    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                let totalSold = 0;
                let totalCapacity = 0;

                // 1. Створюємо масив промісів для квитків (паралельно)
                const ticketPromises = movie.sessions.map(s =>
                    getSessionTickets(s.id).catch(() => []) // ігноруємо помилки окремих сесій
                );

                const uniqueHallIds = Array.from(new Set(movie.sessions.map(s => s.hallId || s.hallName).filter(Boolean))) as string[];
                const hallPromises = uniqueHallIds.map(id =>
                    getHallById(id).catch(() => null)
                );

                const [allTicketsResults, allHallsResults] = await Promise.all([
                    Promise.all(ticketPromises),
                    Promise.all(hallPromises)
                ]);

                // 3. Рахуємо продані квитки
                allTicketsResults.forEach(res => {
                    const arr = Array.isArray(res) ? res : res?.tickets ?? [];
                    totalSold += arr.length;
                });

                // 4. Рахуємо загальну місткість
                // Створюємо карту залів для швидкого доступу
                const hallsMap = new Map();
                allHallsResults.forEach(h => {
                    if (h) {
                        const id = h.id?.id || h.id;
                        const seats = Array.isArray(h.seats) ? h.seats.length : (h.seats?.seats?.length || 0);
                        hallsMap.set(id, seats);
                    }
                });

                movie.sessions.forEach(s => {
                    const hallId = s.hallId || s.hallName;
                    totalCapacity += hallsMap.get(hallId) || 0;
                });

                setTotalTickets(totalSold);
                setTotalSeats(totalCapacity);
            } catch (err) {
                console.error('Failed to aggregate sales data:', err);
            }
        };

        if (movie.sessions?.length > 0) {
            fetchSalesData();
        }
    }, [movie.sessions]);

    const salesPercentage = totalSeats > 0 ? Math.round((totalTickets / totalSeats) * 100) : 0;

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Delete film "${movie.title}"?`)) {
            onDelete(movie.id);
        }
    };

    return (
        <div className='admin-movie-container'>
            <button
                className='admin-delete-movie-btn'
                onClick={handleDelete}
                title="Delete Movie"
            >
                ✕
            </button>

            <div className='admin-movie-main-content'>
                <div className='admin-left-column'>
                    <div className='admin-movie-poster-wrapper'>
                        <img src={movie.poster} alt={movie.title} className='admin-poster-img' />
                    </div>

                    <div className='admin-stats-badge'>
                        <span className='stats-label'>Total Sales</span>
                        <div className='stats-values'>
                            <span className='stats-sold'>{totalTickets}</span>
                            <span className='stats-divider'>/</span>
                            <span className='stats-total'>{totalSeats}</span>
                        </div>
                        <div className='stats-progress-bar'>
                            <div className='stats-progress-fill' style={{ width: `${salesPercentage}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className='admin-right-column'>
                    <div className='admin-movie-header-info'>
                        <h2 className='admin-movie-title'>{movie.title}</h2>
                        <div className='admin-quick-meta'>
                            <span className='meta-tag duration'>{movie.duration}</span>
                            <span className='meta-tag age'>{movie.ageLimit}+</span>
                        </div>
                    </div>

                    <div className='admin-sessions-section'>
                        <h3>Upcoming Sessions</h3>
                        <div className='sessions-by-date-group'>
                            {sortedDates.length > 0 ? (
                                sortedDates.map((date) => (
                                    <div key={date} className='date-block'>
                                        <span className='session-date-header'>{date}</span>
                                        <div className='sessions-row'>
                                            {groupedSessions[date].map((session, idx) => (
                                                <TimeBadge
                                                    key={`${date}-${idx}`}
                                                    session={session}
                                                    showPastDisabled={false}
                                                    movieId={movie.id}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-sessions">No sessions scheduled</p>
                            )}
                        </div>
                    </div>

                    <button
                        className='admin-action-btn'
                        onClick={() => navigate(`/admin/movies/edit/${movie.id}`)}
                    >
                        Edit Details
                    </button>
                </div>
            </div>
        </div>
    );
};