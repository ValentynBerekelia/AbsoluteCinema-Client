import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { deleteMovie, getAdminMoviesStats } from "@/api";
import { mapMoviesForAdmin, MovieAdminCardInfo } from "@/types/Movie";
import { AdminMovieCard } from "../../../components/AdminMovieCard/AdminMovieCard";
import { AdminSearch } from "../../../components/layout/AdminSearch/AdminSearch";
import { useToast } from "@/context/ToastContext/ToastContext";

import styles from "./AdminMainPage.module.css";

export const AdminMainPage = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [movies, setMovies] = useState<MovieAdminCardInfo[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchParams] = useSearchParams();
    const searchTermFromUrl = searchParams.get('search') || '';
    const [nextCursor, setNextCursor] = useState<string | null>(null);

    const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const pageSize = 10;

    const fetchMovies = useCallback(async (cursor: string | null, isNext: boolean) => {
        try {
            setLoading(true);
            const data = await getAdminMoviesStats(searchTermFromUrl, pageSize, cursor || undefined);

            const mapped = mapMoviesForAdmin(data.movies);
            setMovies(mapped);
            setNextCursor(data.nextCursor);

            if (isNext && data.nextCursor && !cursorHistory.includes(data.nextCursor)) {
                setCursorHistory(prev => [...prev, data.nextCursor]);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            showToast('error', 'Could not load admin stats');
        } finally {
            setLoading(false);
        }
    }, [searchTermFromUrl, cursorHistory.length, showToast]);

    useEffect(() => {
        setCursorHistory([null]);
        setCurrentPageIndex(0);
        fetchMovies(null, false);
    }, [searchTermFromUrl]);

    const handleNext = () => {
        if (nextCursor) {
            const nextIdx = currentPageIndex + 1;
            setCurrentPageIndex(nextIdx);
            fetchMovies(nextCursor, true);
        }
    };

    const handleBack = () => {
        if (currentPageIndex > 0) {
            const prevIdx = currentPageIndex - 1;
            const prevCursor = cursorHistory[prevIdx];
            setCurrentPageIndex(prevIdx);
            fetchMovies(prevCursor, false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this movie and all its sessions?")) return;
        try {
            await deleteMovie(id);
            setMovies(prev => prev.filter(m => m.id !== id));
            showToast('success', 'Movie deleted successfully');
        } catch (err) {
            showToast('error', 'Failed to delete movie');
        }
    };

    return (
        <div className={styles.adminContainer}>
            <header className={styles.header}>
                <div className={styles.searchWrapper}>
                    <AdminSearch />
                </div>
                <button
                    className={styles.addButton}
                    onClick={() => navigate('/admin/movies/add')}
                >
                    + Add
                </button>
            </header>

            <main
                className={`${styles.adminCardsList} ${loading ? styles.loading : ""}`}
            >
                {movies.length > 0 ? (
                    movies.map(movie => (
                        <AdminMovieCard
                            key={movie.id}
                            movie={movie}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div className={styles.emptyMessage}>
                        {!loading && <h3>No movies found</h3>}
                    </div>
                )}
            </main>

            <footer className={styles.pagination}>
                <button
                    className={styles.navButton}
                    onClick={handleBack}
                    disabled={currentPageIndex === 0 || loading}
                >
                    ← Previous
                </button>

                <span className={styles.pageIndicator}>
                    Page {currentPageIndex + 1}
                </span>

                <button
                    className={styles.navButton}
                    onClick={handleNext}
                    disabled={!nextCursor || loading}
                >
                    Next →
                </button>
            </footer>
        </div>
    );
};