import { MovieDescription } from "../../components/MovieDescription/MovieDescription";
import { MovieStills } from "../../components/MovieStills/MovieStills";
import { Recommendations } from "../../components/Recommendations/Recommendations";
import { TrailerSection } from "../../components/TrailerSection/TrailerSection";
import { MOCK_MOVIE_DETAILS } from "../../data/DetailsMovie";
import { MOCK_RECOMMENDATIONS } from "../../data/MovieRecommendations";

export const MovieDetailsPage = () => {
    return (
        <div>
            <TrailerSection movie={MOCK_MOVIE_DETAILS}/>
            <MovieDescription movie={MOCK_MOVIE_DETAILS}/>
            <MovieStills movie={MOCK_MOVIE_DETAILS}/>
            <Recommendations recommendations={MOCK_RECOMMENDATIONS}/>
        </div>
    );
}