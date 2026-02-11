import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './Recommendations.css';
import { MovieRecommendation } from '../../types/Movie';
import { NO_POSTER_URL } from '@/constants/movieMetadata';

interface Props {
    recommendations: MovieRecommendation[];
}

export const Recommendations = ({ recommendations }: Props) => {
    const navigate = useNavigate();
    const [startIndex, setStartIndex] = useState(0);

    useEffect(() => {
        setStartIndex(0);
    }, [recommendations]);

    // 1. ЗАХИСТ: Якщо даних немає або це не масив - не рендеримо слайдер
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
        return null;
    }

    const total = recommendations.length;

    const handleNext = () => {
        setStartIndex((prev) => (prev + 1) % total);
    };

    const handlePrev = () => {
        setStartIndex((prev) => (prev - 1 + total) % total);
    };

    const getVisibleItems = () => {
        // 2. ФІКС: Якщо фільмів менше або рівно 3, просто повертаємо їх всі
        if (total <= 3) return recommendations;

        const visible = [];
        for (let i = 0; i < 3; i++) {
            const item = recommendations[(startIndex + i) % total];
            // 3. ДОДАТКОВА ПЕРЕВІРКА: додаємо тільки якщо об'єкт існує
            if (item) visible.push(item);
        }
        return visible;
    };

    const visibleItems = getVisibleItems();

    return (
        <section className="recommendations-section">
            <h2 className="recommendations-title">Watch these too</h2>

            <div className="recommendations-slider-wrapper">
                {total > 3 && (
                    <FontAwesomeIcon icon={faChevronLeft} className="rec-icon-nav" onClick={handlePrev} />
                )}

                <div className="recommendations-container">
                    {visibleItems.map((movie, index) => {
                        // ФІКС:isCenter має сенс тільки якщо у нас 3 елементи на екрані
                        const isCenter = visibleItems.length === 3 ? index === 1 : index === 0;

                        return (
                            // 4. ФІКС: Додаємо перевірку movie?, щоб map не впав
                            movie && (
                                <div key={`${movie.id}-${index}`} className="recommendation-item">
                                    <Link to={`/movie/${movie.id}`} className="recommendation-card">
                                        <img src={movie.posterUrl || NO_POSTER_URL} alt={movie.name} />

                                        {isCenter && (
                                            <>
                                                <div className="card-header-overlay">{movie.name}</div>
                                                <div className="card-footer-overlay">
                                                    <button
                                                        className="recommendation-btn"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            navigate(`/movie/${movie.id}/sessions`);
                                                        }}
                                                    >
                                                        Buy a ticket
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </Link>
                                </div>
                            )
                        );
                    })}
                </div>

                {total > 3 && (
                    <FontAwesomeIcon icon={faChevronRight} className="rec-icon-nav" onClick={handleNext} />
                )}
            </div>
        </section>
    );
};