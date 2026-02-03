import { AdminMovieCard } from "../../../components/AdminMovieCard/AdminMovieCard";
import { ADMIN_MOVIES_DATA } from "../../../data/adminMovies";
import { useEffect, useState } from "react";
import { MoviesQueryParameters, SortOrder } from "@/types/MoviesQueryParameters";
import { getMovies } from "@/api";
import { mapMoviesForAdmin } from "@/types/Movie";
import { useSearchParams } from "react-router-dom";
import { AdminSearch } from "../../../components/layout/AdminSearch/AdminSearch"; 

export const AdminMainPage = () => {
    const [movies, setMovies] = useState(ADMIN_MOVIES_DATA);
    const [loading, setLoading] = useState(true);
    
    const [searchParams] = useSearchParams();
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
            } catch (error) {
                console.error('Failed to fetch movies: ', error);
                setMovies(ADMIN_MOVIES_DATA);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchMovies();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [queryParams]);

    return (
        <>
            <AdminSearch />

            <div 
                className="admin-cards-list" 
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
                    <div style={{ 
                        width: '100%', 
                        textAlign: 'center', 
                        marginTop: '40px',
                        color: '#333'
                    }}>
                        {!loading && <h3>No movies found with this title</h3>}
                    </div>
                )}
            </div>
        </>
    );
};