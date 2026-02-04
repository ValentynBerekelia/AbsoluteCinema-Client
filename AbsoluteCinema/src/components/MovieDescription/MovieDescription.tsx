import { formatToMinutes } from '@/utils/dataTimeConverters';
import { MovieDetails } from '../../types/Movie';
import './MovieDescription.css';

interface Props {
    movie: MovieDetails;
}

export const MovieDescription = ({ movie }: Props) => {
    const genresText = (movie.genres || [])
        .map((g: any) => g?.name ?? g)
        .filter(Boolean)
        .join(', ');
    return (
        <section className="movie-description-section">
            <div className="description-card">
                <div className="description-poster">
                    <img src={movie.posterUrl} alt={movie.title} />
                </div>
                
                <div className="description-content">
                    <h2>Description</h2>
                    <p className="movie-text">{movie.description}</p>
                    
                    <div className="info-grid">
                        <div className="info-item"><span>Genre:</span> {genresText}</div>
                        <div className="info-item"><span>Duration:</span> {formatToMinutes(movie.duration)}</div>
                        <div className="info-item"><span>Age limit:</span> {movie.ageLimit}+</div>
                        <div className="info-item"><span>Country:</span> {movie.country}</div>
                        <div className="info-item"><span>Studio:</span> {movie.studio}</div>
                        <div className="info-item"><span>Language:</span> {movie.language}</div>
                    </div>
                </div>
            </div>
        </section>
    );
};