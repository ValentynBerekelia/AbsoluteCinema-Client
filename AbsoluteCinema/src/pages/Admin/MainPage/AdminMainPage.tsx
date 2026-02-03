import { AdminMovieCard } from "../../../components/AdminMovieCard/AdminMovieCard";
import { ADMIN_MOVIES_DATA } from "../../../data/adminMovies";
import { useEffect, useState } from "react";
import { MoviesQueryParameters, SortOrder } from "@/types/MoviesQueryParameters";
import { getMovies } from "@/api";
import { mapMoviesForAdmin } from "@/types/Movie";
import { useSearchParams } from "react-router-dom";

export const AdminMainPage = () => {
    const [movies, setMovies] = useState(ADMIN_MOVIES_DATA);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [searchParams] = useSearchParams();
    // Extract the search text (or an empty string if nothing was entered)
    const searchTermFromUrl = searchParams.get('search') || '';

    const [queryParams, setQueryParams] = useState<MoviesQueryParameters>({
        pageNumber: 1,
        pageSize: 10,
        sortColumn: 'rate',
        sortOrder: SortOrder.Asc,
        searchTerm: searchTermFromUrl
    });

    useEffect(() => {
            setQueryParams(prev => ({
                ...prev,
                searchTerm: searchTermFromUrl,
                pageNumber: 1
            }));
        }, [searchTermFromUrl]);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const rawData = await getMovies(queryParams);
                const mappedMovies = mapMoviesForAdmin(rawData);
                setMovies(mappedMovies);
                setError(null);
            } catch (error) {
                console.error('Failed to fetch movies: ', error);
                setError('Failed to load movies');
                setMovies(ADMIN_MOVIES_DATA);
            }finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchMovies();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [queryParams]);

    return (
        <div className="admin-cards-list"
            style={{
                opacity: loading ? 0.5 : 1,
                transition: 'opacity 0.3s ease',
                pointerEvents: loading ? 'none' : 'auto',
                minHeight: '200px'
            }}
        >
            {movies.length > 0 ? (
                movies.map(movie => (
                    <AdminMovieCard key={movie.id} movie={movie} />
                ))
            ) : (
                <p style={{color: 'black', textAlign: 'center', marginTop: '20px'}}>
                    {loading ? 'Searching...' : 'No movies found'}
                </p>
            )}
        </div>
    );
};