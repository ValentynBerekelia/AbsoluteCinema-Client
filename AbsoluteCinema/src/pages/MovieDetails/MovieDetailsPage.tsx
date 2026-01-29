import { useEffect, useState } from "react";
import { MovieDescription } from "../../components/MovieDescription/MovieDescription";
import { MovieStills } from "../../components/MovieStills/MovieStills";
import { Recommendations } from "../../components/Recommendations/Recommendations";
import { TrailerSection } from "../../components/TrailerSection/TrailerSection";
import { MOCK_MOVIE_DETAILS } from "../../data/DetailsMovie";
import { MOCK_RECOMMENDATIONS } from "../../data/MovieRecommendations";
import { getMovieById, getMovies } from "../../api/movies";
import {mapMovieDetailsFromApi} from "@/types/Movie";
import { useParams } from "react-router-dom";

export const MovieDetailsPage = () => {
    const {id} = useParams<{id: string}>();
    const [movie, setMovie] = useState(MOCK_MOVIE_DETAILS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError('Movie ID is required');
            setLoading(false);
            return;
        }

        const fetchMovies = async () => {
            try {
                setLoading(true);
                const movieData = mapMovieDetailsFromApi(await getMovieById(id));
                if (movieData) {
                    setMovie(await movieData);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch movies');
                setMovie(MOCK_MOVIE_DETAILS);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        console.warn('Error fetching movies:', error);
    }
    
    return (
        <div>
            <TrailerSection movie={movie}/>
            <MovieDescription movie={movie}/>
            <MovieStills movie={movie}/>
            <Recommendations recommendations={MOCK_RECOMMENDATIONS}/>
        </div>
    );
}