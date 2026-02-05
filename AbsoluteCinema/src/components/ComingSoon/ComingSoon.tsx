import { useState, useEffect } from 'react';
import { SimpleMovieCard } from '../SimpleMovieCard/SimpleMovieCard';
import { getMovies } from '../../api/movies';
import { mapMovieFromApi, MovieCardInfo } from '../../types/Movie';
import { SortOrder } from '@/types/MoviesQueryParameters';
import './ComingSoon.css';

const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const ComingSoon = () => {
    const [upcomingMovies, setUpcomingMovies] = useState<MovieCardInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUpcomingMovies = async () => {
            try {
                setLoading(true);
                setError(null);

                // Calculate date range for the selector (7 days from today)
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const selectorEndDate = new Date(today);
                selectorEndDate.setDate(selectorEndDate.getDate() + 6); // 7 days total (0-6)

                // Fetch movies starting from day 8 onwards (30 days ahead)
                const futureStartDate = new Date(today);
                futureStartDate.setDate(futureStartDate.getDate() + 7);
                
                const futureEndDate = new Date(today);
                futureEndDate.setDate(futureEndDate.getDate() + 30);

                const params = {
                    pageNumber: 1,
                    pageSize: 50,
                    firstDate: formatDateForApi(futureStartDate),
                    secondDate: formatDateForApi(futureEndDate),
                    sortColumn: 'name',
                    sortOrder: SortOrder.Asc
                };

                console.log('Fetching upcoming movies from:', formatDateForApi(futureStartDate), 'to:', formatDateForApi(futureEndDate));

                const data = await getMovies(params);
                const mappedMovies = mapMovieFromApi(data);

                // Filter to ensure we only get movies with sessions in the future range
                const filteredMovies = mappedMovies.filter(movie => {
                    if (!movie.sessions || movie.sessions.length === 0) return false;
                    
                    // Check if the movie has at least one session after day 7
                    return movie.sessions.some((session: any) => {
                        const sessionDate = new Date(session.date);
                        sessionDate.setHours(0, 0, 0, 0);
                        return sessionDate > selectorEndDate;
                    });
                });

                console.log('Filtered upcoming movies:', filteredMovies);
                setUpcomingMovies(filteredMovies);
            } catch (err) {
                console.error('Failed to fetch upcoming movies:', err);
                setError('Failed to load upcoming movies.');
            } finally {
                setLoading(false);
            }
        };

        fetchUpcomingMovies();
    }, []);

    if (loading) {
        return (
            <section className="coming-soon">
                <h2 className="coming-soon__title">Coming Soon</h2>
                <div className="coming-soon__status">Loading upcoming movies...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="coming-soon">
                <h2 className="coming-soon__title">Coming Soon</h2>
                <div className="coming-soon__status coming-soon__status--error">{error}</div>
            </section>
        );
    }

    if (upcomingMovies.length === 0) {
        return null; // Don't show the section if there are no upcoming movies
    }

    const getPremiereDate = (movie: MovieCardInfo): string | undefined => {
        if (!movie.sessions || movie.sessions.length === 0) return undefined;
        
        // Find the earliest session date
        const sortedSessions = [...movie.sessions].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        return sortedSessions[0]?.date;
    };

    return (
        <section className="coming-soon">
            <h2 className="coming-soon__title">Coming Soon</h2>
            <p className="coming-soon__description">
                Movies premiering soon - not yet available in the current schedule
            </p>
            <div className="coming-soon__grid">
                {upcomingMovies.map((movie) => (
                    <SimpleMovieCard 
                        key={movie.id} 
                        movie={movie}
                        premiereDate={getPremiereDate(movie)}
                    />
                ))}
            </div>
        </section>
    );
};
