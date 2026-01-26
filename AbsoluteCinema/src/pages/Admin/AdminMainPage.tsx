import { AdminHeader } from "../../components/AdminHeader/AdminHeader";
import { AdminMovieCard } from "../../components/AdminMovieCard/AdminMovieCard";
import { ADMIN_MOVIES_DATA } from "../../data/adminMovies";

export const AdminMainPage = () => {
    return (
        <div className="admin-cards-list">
            {ADMIN_MOVIES_DATA.map(movie => (
                <AdminMovieCard key={movie.id} movie={movie} />
            ))}
        </div>
    );
};