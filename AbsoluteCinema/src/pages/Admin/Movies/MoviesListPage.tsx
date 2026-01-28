import { useEffect, useState } from 'react';
// import { movieService } from '../../../api/movieService';
import { MovieAdminCardInfo } from '../../../types/Movie';
import { AdminMovieCard } from "../../../components/AdminMovieCard/AdminMovieCard";
import { ADMIN_MOVIES_DATA } from "../../../data/adminMovies";
import './MoviesListPage.css';

export const MoviesListPage = () => {
    const [movies, setMovies] = useState<MovieAdminCardInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMovies = async () => {
            // try {
            //     setLoading(true);
            //     setError(null);
            //     const data = await movieService.getMovies();
            //     setMovies(data);
            // } catch (err) {
            //     setError('Failed to load movies. Using mock data.');
            //     // Fallback to mock data
            //     setMovies(ADMIN_MOVIES_DATA);
            // } finally {
            //     setLoading(false);
            // }
            
            // Using mock data
            setLoading(true);
            setTimeout(() => {
                setMovies(ADMIN_MOVIES_DATA);
                setLoading(false);
            }, 500);
        };

        fetchMovies();
    }, []);

    if (loading) {
        return (
            <div className="admin-cards-list">
                <div className="loading-state">Loading movies...</div>
            </div>
        );
    }

    return (
        <div className="admin-cards-list">
            {error && <div className="error-message">{error}</div>}
            
            {movies.length === 0 ? (
                <div className="no-data">No movies available yet</div>
            ) : (
                movies.map(movie => (
                    <AdminMovieCard key={movie.id} movie={movie} />
                ))
            )}
        </div>
    );
};
