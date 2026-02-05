import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
import './Hero.css'
import { TimeBadge } from '../ui/TimeBadge/TimeBadge';
import { HeroBannerInfo } from '@/types/Movie';

interface HeroProps {
    movies: HeroBannerInfo[]
}

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
};

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

    const movie = movies[currentIndex];
    const movieAvailable = isMovieAvailable(movie);
    const premiereDate = getPremiereDate(movie);

    const nextSlide = () => {
        setCurrentIndex((currentIndex + 1) % movies.length);
    };

    const prevSlide = () => {
        setCurrentIndex((movies.length + currentIndex - 1) % movies.length);
    };

    return (
        <section className="hero">
            <div className="hero-layers">
                {movies.map((m, index) => (
                    <div
                        key={m.id}
                        className={`hero-bg ${index === currentIndex ? 'active' : ''}`}
                        style={{ '--bg-image': `url(${m.image})` } as React.CSSProperties}
                    />
                ))}
            </div>

            <div className="hero-gradient-overlay" />

            <button className='slide-arrow left' onClick={prevSlide}>
                <FontAwesomeIcon icon={faAngleLeft} />
            </button>

            <div className='hero-content'>
                <h1 className='hero-title'>{movie.title }</h1>
                {movieAvailable ? (
                    <>
                        <div className='hero-schedule'>
                            {movie.sessions.map((session, index) => {
                                const sessionDate = new Date(session.date);
                                sessionDate.setHours(0, 0, 0, 0);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const selectorEndDate = new Date(today);
                                selectorEndDate.setDate(selectorEndDate.getDate() + 6);
                                
                                if (sessionDate >= today && sessionDate <= selectorEndDate) {
                                    return (
                                        <TimeBadge
                                            key={index}
                                            session={session}
                                            onclick={() => {
                                                if (session.id) {
                                                    navigate(`/booking/${movie.id}/${session.id}`);
                                                }
                                            }}
                                        />
                                    );
                                }
                                return null;
                            })}
                        </div>
                        <button className='book-now-btn' onClick={() => {
                            if (movie?.id && movie.id !== 'undefined') {
                                navigate(`/movie/${movie.id}/sessions`);
                            }
                        }}>Book your tickets now</button>
                    </>
                ) : (
                    <div className='hero-coming-soon'>
                        <div className='coming-soon-label'>Coming Soon</div>
                        {premiereDate && (
                            <div className='premiere-date'>Premiere: {formatDate(premiereDate)}</div>
                        )}
                    </div>
                )}
                <div className='slider-dots'>
                    {movies.map((_, index) => (
                        <span
                            key={index}
                            className={`dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                        ></span>
                    ))}
                </div>
            </div>

            <button className='slide-arrow right' onClick={nextSlide}>
                <FontAwesomeIcon icon={faAngleRight} />
            </button>
        </section>
    );
};