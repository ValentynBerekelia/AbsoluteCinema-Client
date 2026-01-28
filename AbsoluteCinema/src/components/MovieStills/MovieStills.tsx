import { useState, useEffect } from 'react';
import { MovieDetails } from '../../types/Movie';
import './MovieStills.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface Props {
    movie: MovieDetails;
}

export const MovieStills = ({ movie }: Props) => {
    const initialStills = movie.medias.filter(m => m.type === "Still");
    const [stills, setStills] = useState(initialStills);
    const [direction, setDirection] = useState<'left' | 'right' | null>(null);
    const [visibleCount, setVisibleCount] = useState(3);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 640) {
                setVisibleCount(1);
            } else if (window.innerWidth <= 1024) {
                setVisibleCount(2);
            } else {
                setVisibleCount(3);
            }
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNext = () => {
        setDirection('left');
        setTimeout(() => {
            setStills((prev) => {
                const [first, ...rest] = prev;
                return [...rest, first];
            });
            setDirection(null);
        }, 150);
    };

    const handlePrev = () => {
        setDirection('right');
        setTimeout(() => {
            setStills((prev) => {
                const last = prev[prev.length - 1];
                const rest = prev.slice(0, -1);
                return [last, ...rest];
            });
            setDirection(null);
        }, 150);
    };

    if (stills.length === 0) return null;

    return (
        <section className="stills-section">
            <h2 className="stills-title">Stills from the movie</h2>
            <div className="stills-carousel-container">
                <button className="carousel-btn left" onClick={handlePrev}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                
                <div className="stills-track">
                    {stills.slice(0, visibleCount).map((still, index) => (
                        <div 
                            key={still.id} 
                            className={`still-card ${direction && index === visibleCount - 1 ? `slide-${direction}` : ''}`}
                        >
                            <img src={still.url} alt="Movie still" />
                        </div>
                    ))}
                </div>

                <button className="carousel-btn right" onClick={handleNext}>
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>
        </section>
    );
};