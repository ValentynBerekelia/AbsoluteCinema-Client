import { useState, useEffect } from 'react';
import { getMovieFeatures } from '@/api/movies';
import { mapHeroBannersFromApi, HeroBannerInfo } from '@/types/Movie';

export const useHeroMovies = () => {
    const [heroMovies, setHeroMovies] = useState<HeroBannerInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHeroData = async () => {
            try {
                const data = await getMovieFeatures();
                const mapped = mapHeroBannersFromApi(data);
                setHeroMovies(mapped.length > 0 ? mapped : []);
            } catch (err) {
                setHeroMovies([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHeroData();
    }, []);

    return { heroMovies, isLoading };
};