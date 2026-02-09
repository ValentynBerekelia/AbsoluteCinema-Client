import { useState, useEffect } from 'react';
import { ScheduleMovieCard } from '../ScheduleMovieCard/ScheduleMovieCard';
import { getMovies } from '../../api/movies';
import { mapMovieFromApi, MovieCardInfo } from '../../types/Movie';
import { SortOrder } from '@/types/MoviesQueryParameters';
import './MovieSchedule.css';
import { DateSelector } from '../DateSelector/DateSelector';
// MovieFilters removed from main schedule (filters will be on movie page only)

const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const MovieSchedule = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    });

    // filters removed for main schedule


    const [movies, setMovies] = useState<MovieCardInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                setError(null);
                const dateKey = formatDateForApi(selectedDate);
                
                const params = {
                    pageNumber: 1,
                    pageSize: 20,
                    firstDate: dateKey,
                    secondDate: dateKey,
                    sortColumn: 'name',
                    sortOrder: SortOrder.Asc
                };
                
                console.log('Fetching movies for date:', dateKey);
                
                const data = await getMovies(params);
                const mappedMovies = mapMovieFromApi(data);
                const filteredMovies = mappedMovies
                    .map(movie => ({
                        ...movie,
                        sessions: (movie.sessions || [])
                            .filter((session: any) => session.date === dateKey)
                            .sort((a: any, b: any) => (a.time || '').localeCompare(b.time || ''))
                    }))
                    .filter(movie => movie.sessions && movie.sessions.length > 0)
                    .sort((a, b) => {
                        const aTime = a.sessions?.[0]?.time || '';
                        const bTime = b.sessions?.[0]?.time || '';
                        const timeCompare = aTime.localeCompare(bTime);
                        if (timeCompare !== 0) return timeCompare;
                        return (a.title || '').localeCompare(b.title || '');
                    });
                
                console.log('Mapped movies:', filteredMovies);
                
                setMovies(filteredMovies);
            } catch (err) {
                console.error('Failed to fetch movies:', err);
                setError('Failed to load schedule. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchMovies();
    }, [selectedDate]);

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
    };

    const displayedMovies = movies;

    return (
        <section className="movie-schedule">
            
            
            <DateSelector 
                selectedDate={selectedDate} 
                onDateChange={handleDateChange} 
            />

            {/* Filters removed from main page - moved to movie details/library */}

            <div className="movie-schedule__content">
                {loading && (
                    <div className="movie-schedule__status">Loading...</div>
                )}
                
                {error && (
                    <div className="movie-schedule__status movie-schedule__status--error">
                        {error}
                    </div>
                )}
                
                {!loading && !error && displayedMovies.length === 0 && (
                    <div className="movie-schedule__status">
                        {movies.length > 0 
                            ? "No movies match selected filters" 
                            : "No sessions available for this date"}
                    </div>
                )}
                
                {!loading && !error && displayedMovies.length > 0 && (
                    <div className="movie-schedule__grid">
                        {displayedMovies.map((movie) => (
                            <ScheduleMovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};