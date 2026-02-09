import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { formatDate } from '@/utils/dataTimeConverters';
import './Hero.css'
import { TimeBadge } from '../ui/TimeBadge/TimeBadge';
import { HeroBannerInfo } from '@/types/Movie';

interface HeroProps {
    movies: HeroBannerInfo[]
}

const isMovieAvailable = (movie: HeroBannerInfo): boolean => {
    if (!movie.sessions || movie.sessions.length === 0) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectorEndDate = new Date(today);
    selectorEndDate.setDate(selectorEndDate.getDate() + 6); // 7 days total
    
    return movie.sessions.some((session) => {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate >= today && sessionDate <= selectorEndDate;
    });
};

const getPremiereDate = (movie: HeroBannerInfo): string | undefined => {
    if (!movie.sessions || movie.sessions.length === 0) return undefined;
    
    const sortedSessions = [...movie.sessions].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return sortedSessions[0]?.date;
};

export const Hero : React.FC<HeroProps> = ({movies}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    if (!movies || movies.length === 0) {
        return <section className="hero-loading">Loading...</section>;
    }

    const nextSlide = () => {
        setCurrentIndex((currentIndex + 1) % movies.length);
    };

    const prevSlide = () => {
        setCurrentIndex((currentIndex - 1 + movies.length) % movies.length);
    };

    // Створюємо масив для циклічного показу: prev, current, next
    const getVisibleMovies = () => {
        const prevIndex = (currentIndex - 1 + movies.length) % movies.length;
        const nextIndex = (currentIndex + 1) % movies.length;
        
        return [
            { ...movies[prevIndex], slideIndex: -1, arrayIndex: prevIndex },
            { ...movies[currentIndex], slideIndex: 0, arrayIndex: currentIndex },
            { ...movies[nextIndex], slideIndex: 1, arrayIndex: nextIndex },
        ];
    };

    const visibleMovies = getVisibleMovies();

    return (
        <section className="hero">
            <button className='slide-arrow left' onClick={prevSlide}>
                <FontAwesomeIcon icon={faAngleLeft} />
            </button>
            <button className='slide-arrow right' onClick={nextSlide}>
                <FontAwesomeIcon icon={faAngleRight} />
            </button>

            <div className="hero-carousel-wrapper">
                <div className="hero-carousel" style={{ 
                    transform: 'translateX(0)',
                    justifyContent: 'center'
                }}>
                    {visibleMovies.map((movie, idx) => {
                        const movieAvailable = isMovieAvailable(movie);
                        const premiereDate = getPremiereDate(movie);
                        const upcomingSessions = movie.sessions?.filter(session => {
                            const sessionDate = new Date(session.date);
                            sessionDate.setHours(0, 0, 0, 0);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const selectorEndDate = new Date(today);
                            selectorEndDate.setDate(selectorEndDate.getDate() + 6);
                            return sessionDate >= today && sessionDate <= selectorEndDate;
                        }) || [];

                        const isActive = movie.slideIndex === 0;
                        
                        // Логування для дебагу
                        if (isActive && upcomingSessions.length > 0) {
                            console.log('Hero Sessions:', upcomingSessions[0]);
                        }

                        return (
                            <div 
                                key={`${movie.id}-${idx}`}
                                className={`hero-movie-card ${isActive ? 'active' : ''}`}
                                onClick={() => {
                                    if (!isActive) {
                                        if (movie.slideIndex === -1) prevSlide();
                                        if (movie.slideIndex === 1) nextSlide();
                                    }
                                }}
                            >
                                <div 
                                    className="hero-movie-poster"
                                    style={{ backgroundImage: `url(${movie.image})` }}
                                >
                                    {!movieAvailable && isActive && (
                                        <div className="hero-coming-soon">
                                            <div className='coming-soon-label'>Coming Soon</div>
                                            {premiereDate && (
                                                <div className='premiere-date'>Premiere: {formatDate(premiereDate)}</div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {isActive && (
                                        <div className="hero-movie-info">
                                            <h3 className="hero-movie-title">{movie.title}</h3>
                                            <p className="hero-movie-subtitle">{movie.title} - Malayalam</p>
                                            {movieAvailable && upcomingSessions.length > 0 && (
                                                <div className="hero-movie-timing">
                                                    <div className="hero-timing-label">Today's Timing</div>
                                                    <div className="hero-time-badges">
                                                        {upcomingSessions.slice(0, 3).map((session, idx) => (
                                                            <span 
                                                                key={idx} 
                                                                className="hero-time-badge"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (session?.id && movies[currentIndex]?.id) {
                                                                        navigate(`/booking/${movies[currentIndex].id}/${session.id}`);
                                                                    }
                                                                }}
                                                            >
                                                                {session?.time || '00:00'}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className='slider-dots'>
                {movies.map((_, index) => (
                    <span
                        key={index}
                        className={`dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                    ></span>
                ))}
            </div>
        </section>
    );
};