import ReactPlayer from 'react-player';
import { MovieDetails } from '../../types/Movie';
import './TrailerSection.css';

interface TrailerSectionProps {
    movie: MovieDetails;
}

export const TrailerSection = ({ movie }: TrailerSectionProps) => {
    const trailerUrl = movie.medias.find(m => m.type === "Video")?.url;

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
                        <button className="buy-ticket-btn">Buy a ticket</button>
                    </div>
                </div>
            </div>
        </section>
    );
};