import { useEffect, useState } from "react";
import { MovieDescription } from "../../components/MovieDescription/MovieDescription";
import { MovieStills } from "../../components/MovieStills/MovieStills";
import { Recommendations } from "../../components/Recommendations/Recommendations";
import { TrailerSection } from "../../components/TrailerSection/TrailerSection";
import { MOCK_MOVIE_DETAILS } from "../../data/DetailsMovie";
import { MOCK_RECOMMENDATIONS } from "../../data/MovieRecommendations";
import { getMovieById, getMovieRecommendations, getMovies } from "../../api/movies";
import { mapMovieDetailsFromApi, MovieRecommendation } from "@/types/Movie";
import { useParams } from "react-router-dom";

export const MovieDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const [movie, setMovie] = useState<typeof MOCK_MOVIE_DETAILS>({ ...MOCK_MOVIE_DETAILS, id: id || MOCK_MOVIE_DETAILS.id });
    const [movieRecommendations, setMovieRecommendations] = useState<MovieRecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [movieDataRaw, recommendationsData] = await Promise.all([
                    getMovieById(id),
                    getMovieRecommendations(id, 10)
                ]);

                const mappedMovie = await mapMovieDetailsFromApi(movieDataRaw);

                setMovie(mappedMovie);
                setMovieRecommendations(recommendationsData.movies);
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        console.warn('Error fetching movies:', error);
    }

    return (
        <div>
            <TrailerSection movie={movie} movieId={id} />
            <MovieDescription movie={movie} />
            <MovieStills movie={movie} />
            <Recommendations recommendations={movieRecommendations} />
        </div>
    );
}