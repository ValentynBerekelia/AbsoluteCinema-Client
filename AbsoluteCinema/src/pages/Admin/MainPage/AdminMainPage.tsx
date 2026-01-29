import { AdminMovieCard } from "../../../components/AdminMovieCard/AdminMovieCard";
import { ADMIN_MOVIES_DATA } from "../../../data/adminMovies";
import { useEffect, useState } from "react";
import { MoviesQueryParameters, SortOrder } from "@/types/MoviesQueryParameters";
import { getMovies } from "@/api";
import { mapMoviesForAdmin } from "@/types/Movie";

export const AdminMainPage = () => {
    const [movies, setMovies] = useState(ADMIN_MOVIES_DATA);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [queryParams, setQueryParams] = useState<MoviesQueryParameters>({
        pageNumber: 1,
        pageSize: 10,
        sortColumn: 'rate',
        sortOrder: SortOrder.Asc
    });

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

        fetchMovies();
    }, [queryParams]);

    return (
        <div className="admin-cards-list">
            {movies.map(movie => (
                <AdminMovieCard key={movie.id} movie={movie} />
            ))}
        </div>
    );
};