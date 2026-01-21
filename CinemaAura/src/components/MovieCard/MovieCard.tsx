import { Movie } from '../../types/Movie';
import { TimeBadge } from '../ui/TimeBadge/TimeBadge';
import './MovieCard.css';

interface MovieCardProps {
    movie: Movie
}

export const MovieCard = ({movie}: MovieCardProps) => {
    return (
        <div className='movie-card'>
            <div className='movie-card-header'>
                <h2 className='movie-title'>{movie.title}</h2>
                <div className='movie-age-format'>
                    <span className='movie-age-limit'>{movie.ageLimit}+</span>
                    <span className='movie-format'>{movie.format}</span>
                </div>
            </div>
            <div className='movie-card-content'>
                <div className='movie-card-poster'>
                    <img src={movie.image} alt={movie.title} />
                </div>
                <div className='movie-card-right'>
                    <div className='movie-card-schedule'>
                        {movie.schedule.map((time, index) => (
                            <TimeBadge key={index} time={time}/>
                        ))}
                    </div>
                    <div className='movie-card-description'>
                        <p><span>Genre:</span> {movie.genre || "Genre not specified"}</p>
                        <p><span>Duration:</span> {movie.duration} min</p>
                        <p><span>Director(s):</span> {movie.director}</p>
                        <p><span>Starring:</span> {movie.starring}</p>
                    </div>
                    <a href="#" className='see-more'>See more details...</a>
                </div>
            </div>
        </div>
    );
};