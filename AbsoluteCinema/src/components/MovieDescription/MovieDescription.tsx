import { MovieDetails } from '../../types/Movie';
import { formatToMinutes } from '../../utils/timeFormat';
import './MovieDescription.css';

interface Props {
    movie: MovieDetails;
}

export const MovieDescription = ({ movie }: Props) => {
    const posterUrl = movie.medias.find(m => m.type === "Poster")?.url;

    return (
        <section className="movie-description-section">
            <div className="description-card">
                <div className="description-poster">
                    <img src={posterUrl} alt={movie.title} />
                </div>
                
                <div className="description-content">
                    <h2>Description</h2>
                    <p className="movie-text">{movie.description}</p>
                    
                    <div className="info-grid">
                        <div className="info-item"><span>Genre:</span> {movie.genres.map(g => g.name).join(', ')}</div>
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