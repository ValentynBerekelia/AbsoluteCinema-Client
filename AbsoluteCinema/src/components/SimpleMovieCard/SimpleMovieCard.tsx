import { Link } from 'react-router-dom';
import { MovieCardInfo } from '../../types/Movie';
import './SimpleMovieCard.css';

interface SimpleMovieCardProps {
    movie: MovieCardInfo;
    premiereDate?: string;
}

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${day} ${month}`;
};

export const SimpleMovieCard = ({ movie, premiereDate }: SimpleMovieCardProps) => {
    return (
        <Link to={`/movie/${movie.id}`} className="simple-movie-card">
            <div className="simple-movie-card__poster">
                <img src={movie.image} alt={movie.title} />
                {premiereDate && (
                    <div className="simple-movie-card__date-badge">
                        {formatDate(premiereDate)}
                    </div>
                )}
            </div>
            <h3 className="simple-movie-card__title">{movie.title}</h3>
        </Link>
    );
};
