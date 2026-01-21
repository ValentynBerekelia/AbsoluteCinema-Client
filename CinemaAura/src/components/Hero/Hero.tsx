import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { HERO_MOVIES } from '../../data/movies';
import './Hero.css'
import { TimeBadge } from '../ui/TimeBadge/TimeBadge';

export const Hero = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const movie = HERO_MOVIES[currentIndex];
    
    const handleSlideChange = (newIndex: number) => {
        if (isFading) return;
        setIsFading(true);
        setTimeout(() => {
            setCurrentIndex(newIndex);
            setIsFading(false);
        }, 500);
    };

    const nextSlide = () => {
        handleSlideChange((currentIndex + 1) % HERO_MOVIES.length);
    };

    const prevSlide = () => {
        handleSlideChange((HERO_MOVIES.length + currentIndex - 1) % HERO_MOVIES.length);
    };

    return (
        <section 
            className={`hero ${isFading ? 'fade-out' : ''}`}
            style={{ '--bg-image': `url(${movie.image})` } as React.CSSProperties}
        >
            <button className='slide-arrow left' onClick={prevSlide}><FontAwesomeIcon icon={faAngleLeft} /></button>
            <div className='hero-content' key={movie.id}>
                <h1 className='hero-title'>{movie.title}</h1>
                <div className='hero-schedule'>
                    {movie.schedule.map((time, index) => (
                        <TimeBadge key={index} time={time}/>
                    ))}
                </div>
                <button className='book-now-btn'>Book your tickets now</button>
                <div className='slider-dots'>
                    {HERO_MOVIES.map((_, index) => (
                        <span
                            key={index}
                            className={`dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => handleSlideChange(index)}
                        ></span>
                    ))}
                </div>
            </div>
            <button className='slide-arrow right' onClick={nextSlide}><FontAwesomeIcon icon={faAngleRight} /></button>
        </section>
    );
};