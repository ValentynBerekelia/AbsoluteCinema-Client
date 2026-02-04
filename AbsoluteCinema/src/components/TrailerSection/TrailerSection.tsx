import ReactPlayer from 'react-player';
import { Link } from 'react-router-dom';
import { MovieDetails } from '../../types/Movie';
import './TrailerSection.css';
import { MediaType } from '@/types/Media';

interface TrailerSectionProps {
    movie: MovieDetails;
    movieId?: string;
}

export const TrailerSection = ({ movie, movieId }: TrailerSectionProps) => {
    const trailerUrl = movie.medias.find(m => m.type === MediaType.Video)?.url;

    const targetPath = movieId ? `/movie/${movieId}/sessions` : '#';

    return (
        <section className="trailer-section">
            <div className="player-wrapper">
                <ReactPlayer
                    src={trailerUrl}
                    width="100%"
                    height="100%"
                    playing={false}
                    controls={true}
                    className="react-player"
                />
            </div>
            
            <div className="trailer-overlay">
                <div className="trailer-info-bar">
                    <h1 className="movie-title-main">{movie.title}</h1>
                    <div className="trailer-actions">
                        <span className="age-badge">{movie.ageLimit}+</span>
                        <span className="format-badge">XD</span>
                        <Link className="buy-ticket-btn" to={targetPath}>
                            Buy a ticket
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};