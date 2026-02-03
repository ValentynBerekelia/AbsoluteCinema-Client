import { useState, useEffect } from 'react';
import { MovieDetails } from '../../types/Movie';
import './MovieStills.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface Props {
    movie: MovieDetails;
}

export const MovieStills = ({ movie }: Props) => {
    // Тепер беремо кадри напряму з масиву stills
    const [stills, setStills] = useState(movie.stills || []);
    const [direction, setDirection] = useState<'left' | 'right' | null>(null);
    const [visibleCount, setVisibleCount] = useState(3);

    // Слідкуємо за зміною пропсів (якщо перейшли на інший фільм)
    useEffect(() => {
        setStills(movie.stills || []);
    }, [movie.stills]);

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

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNext = () => {
        if (stills.length <= visibleCount) return;
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
        if (stills.length <= visibleCount) return;
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

    if (!stills || stills.length === 0) return null;

    return (
        <section className="stills-section">
            <h2 className="stills-title">Stills from the movie</h2>
            <div className="stills-carousel-container">
                {stills.length > visibleCount && (
                    <button className="carousel-btn left" onClick={handlePrev}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                )}
                
                <div className="stills-track">
                    {stills.slice(0, visibleCount).map((still, index) => (
                        <div 
                            key={still.id || index} 
                            className={`still-card ${direction && index === visibleCount - 1 ? `slide-${direction}` : ''}`}
                        >
                            <img src={still.url} alt={`Still from ${movie.title}`} />
                        </div>
                    ))}
                </div>

                {stills.length > visibleCount && (
                    <button className="carousel-btn right" onClick={handleNext}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                )}
            </div>
        </section>
    );
};