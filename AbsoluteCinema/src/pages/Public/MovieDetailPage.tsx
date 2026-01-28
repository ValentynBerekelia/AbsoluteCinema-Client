import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MOVIES } from '../../data/movies';
import './MovieDetailPage.css';

export const MovieDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [movie, setMovie] = useState<any>(null);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const foundMovie = MOVIES.find(m => m.id === id);
            setMovie(foundMovie || null);
            setLoading(false);
        }, 500);
    }, [id]);

    if (loading) {
        return (
            <div className="movie-detail-page">
                <div className="loading-state">Loading movie...</div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="movie-detail-page">
                <h2>Movie not found</h2>
                <button onClick={() => navigate('/')} className="back-btn">
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="movie-detail-page">
            <button onClick={() => navigate('/')} className="back-btn">
                ← Back to Movies
            </button>

            <div className="movie-detail-content">
                <div className="movie-detail-poster">
                    <img src={movie.image} alt={movie.title} />
                </div>

                <div className="movie-detail-info">
                    <h1>{movie.title}</h1>
                    
                    <div className="movie-badges">
                        <span className="age-badge">{movie.ageLimit}+</span>
                        <span className="format-badge">{movie.format}</span>
                    </div>

                    <div className="movie-details-grid">
                        <div className="detail-item">
                            <label>Genre:</label>
                            <span>{movie.genre || "Not specified"}</span>
                        </div>
                        <div className="detail-item">
                            <label>Duration:</label>
                            <span>{movie.duration} min</span>
                        </div>
                        <div className="detail-item">
                            <label>Director(s):</label>
                            <span>{movie.director}</span>
                        </div>
                        <div className="detail-item">
                            <label>Starring:</label>
                            <span>{movie.starring}</span>
                        </div>
                        <div className="detail-item">
                            <label>Year:</label>
                            <span>{movie.year || "Not specified"}</span>
                        </div>
                        <div className="detail-item">
                            <label>Country:</label>
                            <span>{movie.country || "Not specified"}</span>
                        </div>
                    </div>

                    {movie.description && (
                        <div className="movie-description">
                            <h3>Description</h3>
                            <p>{movie.description}</p>
                        </div>
                    )}

                    <div className="sessions-section">
                        <h3>Available Sessions</h3>
                        {movie.sessions && movie.sessions.length > 0 ? (
                            <div className="sessions-grid">
                                {movie.sessions.map((session: any, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => navigate(`/booking/${id}/${index}`)}
                                        className="session-btn"
                                    >
                                        <span className="session-time">{session.time}</span>
                                        <span className="session-date">{session.date}</span>
                                        <span className="session-action">Book Now</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="no-sessions">No sessions available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
