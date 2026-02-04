import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './Recommendations.css';
import { MovieRecommendation } from '../../types/Movie';

interface Props {
    recommendations: MovieRecommendation[];
}

export const Recommendations = ({ recommendations }: Props) => {
    const [items, setItems] = useState<MovieRecommendation[]>(recommendations);
    const visible = items.slice(0, 3);

    const rotate = (direction: 'left' | 'right') => {
        setItems(prev => {
            if (direction === 'right') {
                const [first, ...rest] = prev;
                return [...rest, first];
            }
            const last = prev[prev.length - 1];
            const rest = prev.slice(0, -1);
            return [last, ...rest];
        });
    };

    return (
        <section className="recommendations-section">
            <h2 className="recommendations-title">Watch these too</h2>

            <div className="recommendations-slider-wrapper">
                <FontAwesomeIcon 
                    icon={faChevronLeft} 
                    className="rec-icon-nav" 
                    onClick={() => rotate('left')} 
                />

                <div className="recommendations-container">
                    {visible.map((movie, index) => {
                        const isCenter = index === 1;
                        return (
                            <div key={movie.id} className="recommendation-item">
                                <Link to={`/movie/${movie.id}`} className="recommendation-card">
                                    <img src={movie.poster} alt={movie.title} />
                                    
                                    {isCenter && (
                                        <>
                                            <div className="card-header-overlay">
                                                {movie.title}
                                            </div>
                                            <div className="card-footer-overlay">
                                                <button className="recommendation-btn">Buy a ticket</button>
                                            </div>
                                        </>
                                    )}
                                </Link>
                            </div>
                        );
                    })}
                </div>

                <FontAwesomeIcon 
                    icon={faChevronRight} 
                    className="rec-icon-nav" 
                    onClick={() => rotate('right')} 
                />
            </div>
        </section>
    );
};