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

export const Hero : React.FC<HeroProps> = ({movies}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    if (!movies || movies.length === 0) {
        return <section className="hero-loading">Loading...</section>;
    }

    const movie = movies[currentIndex];

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
                <div className='hero-schedule'>
                    {movie.sessions.map((session, index) => (
                        <TimeBadge
                            key={index}
                            session={session}
                            onclick={() => {
                                if (session.id) {
                                    navigate(`/booking/${movie.id}/${session.id}`);
                                }
                            }}
                        />
                    ))}
                </div>
                <button className='book-now-btn' onClick={() => {
                    if (movie?.id && movie.id !== 'undefined') {
                        navigate(`/movie/${movie.id}/sessions`);
                    }
                }}>Book your tickets now</button>
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