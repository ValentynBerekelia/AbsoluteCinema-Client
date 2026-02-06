import { useEffect, useState } from 'react';
import { Hero } from '../../components/Hero/Hero';
import { getMovieFeatures } from '../../api/movies';
import { HeroBannerInfo, mapHeroBannersFromApi } from '../../types/Movie';
import { HERO_MOVIES } from '../../data/heroMovies';
import './Home.css';
import { MovieSchedule } from '@/components/MovieSchedule/MovieSchedule';
import { ComingSoon } from '@/components/ComingSoon/ComingSoon';

export const Home = () => {
    const [heroMovies, setHeroMovies] = useState<HeroBannerInfo[]>(HERO_MOVIES);

    useEffect(() => {
        getMovieFeatures()
            .then((data) => {
                if (data) {
                    const mapped = mapHeroBannersFromApi(data);
                    if (mapped.length > 0) {
                        setHeroMovies(mapped);
                        return;
                    }
                }
                setHeroMovies(HERO_MOVIES);
            })
            .catch(() => {
                setHeroMovies(HERO_MOVIES);
            });
    }, []);

    return (
        <main className="home-page">
            <Hero movies={heroMovies}/>
            
            <div className="home-container">
                <MovieSchedule />
                
                <ComingSoon />
            </div>
        </main>
    );
};