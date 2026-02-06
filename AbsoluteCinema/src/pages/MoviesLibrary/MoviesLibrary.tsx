import { useState, useEffect } from 'react';
import { SimpleMovieCard } from '../../components/SimpleMovieCard/SimpleMovieCard';
import { getMovies } from '../../api/movies';
import { mapMovieFromApi, MovieCardInfo } from '../../types/Movie';
import { MovieFilters } from '../../components/MovieFilters/MovieFilters';
import { SortOrder } from '@/types/MoviesQueryParameters';
import './MoviesLibrary.css';

export const MoviesLibrary = () => {
    const [movies, setMovies] = useState<MovieCardInfo[]>([]);
    const [filteredMovies, setFilteredMovies] = useState<MovieCardInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedFormat, setSelectedFormat] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAllMovies = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const params = {
                    pageNumber: 1,
                    pageSize: 100, // Fetch a large number to get all movies
                    sortColumn: 'name',
                    sortOrder: SortOrder.Asc
                };
                
                const data = await getMovies(params);
                const mappedMovies = mapMovieFromApi(data);
                
                setMovies(mappedMovies);
                setFilteredMovies(mappedMovies);
            } catch (err) {
                console.error('Failed to fetch movies:', err);
                setError('Failed to load movies. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchAllMovies();
    }, []);

    useEffect(() => {
        let result = movies;

        // Filter by search term
        if (searchTerm) {
            result = result.filter(movie =>
                movie.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                movie.genre?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by genres
        if (selectedGenres.length > 0) {
            result = result.filter(movie =>
                selectedGenres.some(selected =>
                    movie.genre?.toLowerCase().includes(selected.toLowerCase())
                )
            );
        }

        // Filter by format
        if (selectedFormat) {
            result = result.filter(movie =>
                movie.sessions?.some((s: any) => s.movieType === selectedFormat)
            );
        }

        setFilteredMovies(result);
    }, [searchTerm, selectedGenres, selectedFormat, movies]);

    return (
        <main className="movies-library-page">
            <div className="movies-library-container">
                <section className="movies-library-header">
                    <h1 className="movies-library-title">Movies Library</h1>
                    <p className="movies-library-subtitle">
                        Explore our complete collection of movies
                    </p>
                </section>

                <div className="movies-library-controls">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search movies by title or genre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <MovieFilters 
                        selectedGenres={selectedGenres}
                        selectedFormat={selectedFormat}
                        onSelectGenre={setSelectedGenres}
                        onSelectFormat={setSelectedFormat}
                    />
                </div>

                <div className="movies-library-content">
                    {loading && (
                        <div className="movies-library-status">Loading movies...</div>
                    )}
                    
                    {error && (
                        <div className="movies-library-status movies-library-status--error">
                            {error}
                        </div>
                    )}
                    
                    {!loading && !error && filteredMovies.length === 0 && (
                        <div className="movies-library-status">
                            {movies.length > 0 
                                ? "No movies match your search or filters" 
                                : "No movies available"}
                        </div>
                    )}
                    
                    {!loading && !error && filteredMovies.length > 0 && (
                        <>
                            <div className="movies-count">
                                Showing {filteredMovies.length} {filteredMovies.length === 1 ? 'movie' : 'movies'}
                            </div>
                            <div className="movies-library-grid">
                                {filteredMovies.map((movie) => (
                                    <SimpleMovieCard key={movie.id} movie={movie} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
};
