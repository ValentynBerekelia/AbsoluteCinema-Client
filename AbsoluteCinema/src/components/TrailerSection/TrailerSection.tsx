import { useState } from 'react';
import ReactPlayer from 'react-player';
<<<<<<< Updated upstream
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
=======
import { Link } from 'react-router-dom';
>>>>>>> Stashed changes
import { MovieDetails } from '../../types/Movie';
import './TrailerSection.css';

interface TrailerSectionProps {
    movie: MovieDetails;
    movieId?: string;
}

<<<<<<< Updated upstream
export const TrailerSection = ({ movie }: TrailerSectionProps) => {
    const [currentTrailerIndex, setCurrentTrailerIndex] = useState(0);

    const trailers = movie.trailers || [];
    const hasTrailers = trailers.length > 0;
    const currentTrailer = trailers[currentTrailerIndex];

    const nextTrailer = () => {
        setCurrentTrailerIndex((prev) => (prev + 1) % trailers.length);
    };

    const prevTrailer = () => {
        setCurrentTrailerIndex((prev) => (prev - 1 + trailers.length) % trailers.length);
    };
=======
export const TrailerSection = ({ movie, movieId }: TrailerSectionProps) => {
    const trailerUrl = movie.medias.find(m => m.type === MediaType.Video)?.url;
>>>>>>> Stashed changes

    const targetPath = movieId ? `/movie/${movieId}/sessions` : '#';

    return (
        <section className="trailer-section">
            <div className="player-wrapper">
                {hasTrailers ? (
                    <ReactPlayer
                        src={currentTrailer.url}
                        width="100%"
                        height="100%"
                        playing={false}
                        controls={true}
                        className="react-player"
                        config={{
                            youtube: { origin: window.location.origin }
                        }}
                    />
                ) : (
                    <div className="no-video-placeholder">
                        <img src={movie.bannerUrl} alt="Banner" className="fallback-banner" />
                    </div>
                )}
            </div>

            {trailers.length > 1 && (
                <div className="trailer-navigation">
                    <button className="nav-arrow left" onClick={prevTrailer}>
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </button>
                    <button className="nav-arrow right" onClick={nextTrailer}>
                        <FontAwesomeIcon icon={faAngleRight} />
                    </button>
                </div>
            )}

            <div className="trailer-overlay">
                <div className="trailer-info-bar">
                    <div className="title-group">
                        <h1 className="movie-title-main">{movie.title}</h1>
                        {trailers.length > 1 && (
                            <span className="trailer-counter">
                                Trailer {currentTrailerIndex + 1} / {trailers.length}
                            </span>
                        )}
                    </div>
                    <div className="trailer-actions">
                        <span className="age-badge">{movie.ageLimit}+</span>
<<<<<<< Updated upstream
                        <span className="format-badge">IMAX</span>
                        <button className="buy-ticket-btn">Buy a ticket</button>
=======
                        <span className="format-badge">XD</span>
                        <Link className="buy-ticket-btn" to={targetPath}>
                            Buy a ticket
                        </Link>
>>>>>>> Stashed changes
                    </div>
                </div>
            </div>
        </section>
    );
};