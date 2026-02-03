import { useState, useEffect } from 'react';
import { ScheduleMovieCard } from '../ScheduleMovieCard/ScheduleMovieCard';
import { getMovies } from '../../api/movies';
import { mapMovieFromApi, MovieCardInfo } from '../../types/Movie';
import './MovieSchedule.css';
import { DateSelector } from '../DateSelector/DateSelector';

const formatDateForApi = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const MovieSchedule = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    });
    const [movies, setMovies] = useState<MovieCardInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Add sessionDate parameter or another parameters for revorked query from backend 
                const params = {
                    pageNumber: 1,
                    pageSize: 20,
                    // parameters
                };
                
                console.log('Fetching movies for date:', formatDateForApi(selectedDate));
                
                const data = await getMovies(params);
                const mappedMovies = mapMovieFromApi(data);
                
                console.log('Mapped movies:', mappedMovies);
                
                setMovies(mappedMovies);
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

    return (
        <section className="movie-schedule">
            <h2 className="movie-schedule__title">Session Schedule</h2>
            
            <DateSelector 
                selectedDate={selectedDate} 
                onDateChange={handleDateChange} 
            />

            <div className="movie-schedule__content">
                {loading && (
                    <div className="movie-schedule__status">Loading...</div>
                )}
                
                {error && (
                    <div className="movie-schedule__status movie-schedule__status--error">
                        {error}
                    </div>
                )}
                
                {!loading && !error && movies.length === 0 && (
                    <div className="movie-schedule__status">
                        No sessions available for this date
                    </div>
                )}
                
                {!loading && !error && movies.length > 0 && (
                    <div className="movie-schedule__grid">
                        {movies.map((movie) => (
                            <ScheduleMovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};