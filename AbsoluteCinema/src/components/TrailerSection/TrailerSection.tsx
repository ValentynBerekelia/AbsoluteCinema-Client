import { useState } from 'react';
import ReactPlayer from 'react-player';
import { Link } from 'react-router-dom';
import { MovieDetails } from '../../types/Movie';
import './TrailerSection.css';

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