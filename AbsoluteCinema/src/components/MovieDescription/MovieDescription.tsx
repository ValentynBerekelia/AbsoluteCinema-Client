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
                        <div className="info-item">
                            <span>Genre:</span> 
                            <span>{genresText}</span>
                        </div>
                        <div className="info-item">
                            <span>Duration:</span> 
                            <span>{formatToMinutes(movie.duration)}</span>
                        </div>
                        <div className="info-item info-item--special">
                            <span>Age limit:</span> 
                            <span className="age-badge">{movie.ageLimit}+</span>
                        </div>
                        <div className="info-item">
                            <span>Country:</span> 
                            <span>{movie.country}</span>
                        </div>
                        <div className="info-item">
                            <span>Studio:</span> 
                            <span>{movie.studio}</span>
                        </div>
                        <div className="info-item">
                            <span>Language:</span> 
                            <span>{movie.language}</span>
                        </div>
                        {movie.directors && movie.directors.length > 0 && (
                            <div className="info-item">
                                <span>Directors:</span> 
                                <span>{movie.directors.join(', ')}</span>
                            </div>
                        )}
                        {movie.starring && movie.starring.length > 0 && (
                            <div className="info-item">
                                <span>Starring:</span> 
                                <span>{movie.starring.join(', ')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};