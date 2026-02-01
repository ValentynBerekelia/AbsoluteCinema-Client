import { useEffect, useState } from 'react';
import { Hero } from '../../components/Hero/Hero';
import { MovieSchedule } from '../../components/MovieSchedule/MovieSchedule';
import { PromotionForm } from '../../components/PromotionForm/PromotionForm';
import { getMovieFeatures } from '../../api/movies';
import { mapHeroBannersFromApi, HeroBannerInfo } from '../../types/Movie';
import { HERO_MOVIES } from '../../data/heroMovies';
import './Home.css';

export const Home = () => {
    const [heroMovies, setHeroMovies] = useState<HeroBannerInfo[]>(HERO_MOVIES);

    useEffect(() => {
        const fetchFeaturedMovies = async () => {
            try {
                const data = await getMovieFeatures();
                const mappedBanners = mapHeroBannersFromApi(data);

                if (mappedBanners.length > 0) {
                    setHeroMovies(mappedBanners);
                }
            } catch (error) {
                console.error('Failed to fetch featured movies:', error);
            }
        };

        fetchFeaturedMovies();
    }, []);

    return (
        <main className="home-page">
            <Hero movies={heroMovies} />
            
            <div className="home-container">
                <MovieSchedule />

                <section className="promotion-section" id="promotion">
                    <h2 className="promotion-title">
                        Want to place an advertisement with us?
                    </h2>
                    <div className="promotion-group">
                        <div className="promotion-info">
                            <p className="promotion-text">
                                <span>Please send an offer<br />to our email:<br /></span>
                                <a href="mailto:ad@absolutecinema.com">
                                    ad@absolutecinema.com
                                </a>
                            </p>
                        </div>
                        <PromotionForm />
                    </div>
                </section>
            </div>
        </main>
    );
};