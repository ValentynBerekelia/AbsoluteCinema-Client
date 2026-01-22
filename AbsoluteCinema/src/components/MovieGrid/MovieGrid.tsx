import './MovieGrid.css'
import { MovieCard } from '../MovieCard/MovieCard'
import { Movie } from '../../types/Movie';

interface MovieGridProps {
    movies: Movie[];
}

export const MovieGrid = ({movies} : MovieGridProps) => {
    return (
        <div className='movie-grid'>
            {movies.map(movie => (
                <MovieCard key={movie.id} movie={movie}/>
            ))}
        </div>
    );
};