import { useState, useEffect } from 'react';
import { getMovies } from '@/api';
import { mapMoviesForAdmin, MovieAdminCardInfo } from '@/types/Movie';
import { MoviesQueryParameters } from '@/types/MoviesQueryParameters';

export const useMovies = (queryParams: MoviesQueryParameters) => {
    const [movies, setMovies] = useState<MovieAdminCardInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const rawData = await getMovies(queryParams);
                setMovies(mapMoviesForAdmin(rawData));
                setError(null);
            } catch (err) {
                setError('Failed to load movies');
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, [queryParams]);

    return { movies, loading, error };
};