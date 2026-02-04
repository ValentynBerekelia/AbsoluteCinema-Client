import { useEffect, useState } from 'react';
import { Hero } from '../../components/Hero/Hero';
import { PromotionForm } from '../../components/PromotionForm/PromotionForm';
import { getMovieFeatures } from '../../api/movies';
import { mapHeroBannersFromApi, HeroBannerInfo } from '../../types/Movie';
import { HERO_MOVIES } from '../../data/heroMovies';
import './Home.css';
import { MovieSchedule } from '@/components/MovieSchedule/MovieSchedule';
import { useHeroMovies } from '@/hooks/useHeroMovies';

export const Home = () => {
    const {heroMovies, isLoading} = useHeroMovies();

    return (
        <main className="home-page">
            <Hero movies={heroMovies}/>
            
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