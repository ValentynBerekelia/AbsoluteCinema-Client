import { useState, useEffect } from 'react';
import { getMovieFeatures } from '@/api/movies';
import { mapHeroBannersFromApi, HeroBannerInfo } from '@/types/Movie';
import { HERO_MOVIES } from '@/data/heroMovies';

export const useHeroMovies = () => {
    const [heroMovies, setHeroMovies] = useState<HeroBannerInfo[]>(HERO_MOVIES);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHeroData = async () => {
            try {
                const data = await getMovieFeatures();
                const mapped = mapHeroBannersFromApi(data);
                if (mapped.length > 0) {
                    setHeroMovies(mapped);
                }
            } catch (err) {
                console.warn('Failed to fetch hero movies, using defaults:', err);
                setHeroMovies(HERO_MOVIES);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHeroData();
    }, []);

    return { heroMovies, isLoading };
};