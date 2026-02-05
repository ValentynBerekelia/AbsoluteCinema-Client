import { AdminMovieCard } from "../../../components/AdminMovieCard/AdminMovieCard";
import { ADMIN_MOVIES_DATA } from "../../../data/adminMovies";
import { useEffect, useState } from "react";
import { MoviesQueryParameters, SortOrder } from "@/types/MoviesQueryParameters";
import { deleteMovie, getMovies } from "@/api";
import { mapMoviesForAdmin } from "@/types/Movie";
import { useSearchParams } from "react-router-dom";
import { AdminSearch } from "../../../components/layout/AdminSearch/AdminSearch";
import { useToast } from "@/context/ToastContext/ToastContext";

export const AdminMainPage = () => {
        const { showToast } = useToast();

    const [movies, setMovies] = useState(ADMIN_MOVIES_DATA);
    const [loading, setLoading] = useState(true);

    const [searchParams] = useSearchParams();
    const searchTermFromUrl = searchParams.get('search') || '';

    const [queryParams, setQueryParams] = useState<MoviesQueryParameters>(() => {
        const today = new Date();
        const tenDaysLater = new Date();
        tenDaysLater.setDate(today.getDate() + 10);

        return {
            pageNumber: 1,
            pageSize: 10,
            sortColumn: 'rate',
            sortOrder: SortOrder.Asc,
            searchTerm: searchTermFromUrl,
            firstDate: today.toISOString().split('T')[0],
            secondDate: tenDaysLater.toISOString().split('T')[0],
        };
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

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this movie and all his sessions?")) return;

        try {
            await deleteMovie(id);
            setMovies(prev => prev.filter(m => m.id !== id));
            showToast('success', 'Movie deleted successfully');
        } catch (err) {
            showToast('error', 'Failed to delete movie');
        }
    };

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
                        <AdminMovieCard key={movie.id} movie={movie} onDelete={handleDelete}/>
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