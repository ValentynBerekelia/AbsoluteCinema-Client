import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { movieService } from '../../../api/movieService';
import './AddMoviePage.css';
import { MovieAddForm } from '../../../../components/MovieAddForm/MovieAddForm';
import { CreateMovieRequest, MovieFormData } from '../../../../types/CreateMovieRequest';
import { createMovie } from '../../../../api/movies';
import { SessionManager } from '@/components/SessionManager/SessionManager';
import { MOCK_HALLS, MOCK_SEAT_TYPES } from '@/data/hallsData';

interface SessionFormData {
    id: string;
    dateFrom: string;
    dateTo: string;
    time: string;
    hall: string;
    averagePrice: string;
    first3RowPrice: string;
    vipPrice: string;
}

export const AddMoviePage = () => {
    const AVAILABLE_HALLS = MOCK_HALLS;
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<MovieFormData>({
        movieName: 'Add Movie Title',
        description: '',
        rate: 0,
        ageLimit: 0,
        duration: '',
        country: '',
        studio: '',
        language: '',
        genres: [],
        directors: [],
        starring: [],
        poster: null as File | null
    });

    const [sessions, setSessions] = useState<SessionFormData[]>([
        {
            id: '1',
            dateFrom: '',
            dateTo: '',
            time: '11:00',
            hall: '',
            averagePrice: '',
            first3RowPrice: '',
            vipPrice: ''
        }
    ]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                poster: file
            }));
        }
    };

    const handleSessionChange = (id: string, field: keyof SessionFormData, value: string) => {
        setSessions(prev => prev.map(session =>
            session.id === id ? { ...session, [field]: value } : session
        ));
    };

    const addSession = () => {
        const newSession: SessionFormData = {
            id: Date.now().toString(),
            dateFrom: '',
            dateTo: '',
            time: '11:00',
            hall: '',
            averagePrice: '',
            first3RowPrice: '',
            vipPrice: ''
        };
        setSessions(prev => [...prev, newSession]);
    };

    const removeSession = (id: string) => {
        if (sessions.length > 1) {
            setSessions(prev => prev.filter(session => session.id !== id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {

            const moviePayload: CreateMovieRequest = {
                movieName: formData.movieName,
                description: formData.description,
                rate: formData.rate,
                ageLimit: formData.ageLimit,
                duration: formData.duration,
                country: formData.country,
                studio: formData.studio,
                language: formData.language,
                genres: formData.genres
            };

            const result = await createMovie(moviePayload);
            console.log('Movie created with ID:', result.id);

            // Переходимо на список фільмів
            navigate('/admin/movies');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create movie');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="add-movie-page">
            <div className="add-movie-header">
                <h2>Add New Movie</h2>
                <button onClick={() => navigate('/admin/movies')} className="back-btn">
                    Back to Movies
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="add-movie-form">
                <MovieAddForm formData={formData} setFormData={setFormData} />

                {/* Sessions Section */}
                <SessionManager
                    sessions={sessions}
                    halls={AVAILABLE_HALLS}
                    seatTypes={MOCK_SEAT_TYPES}
                    onAddSession={addSession}
                    onRemoveSession={removeSession}
                    onSessionChange={handleSessionChange}
                />

                {/* Submit */}
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={saving}>
                        {saving ? 'Creating Movie...' : 'Create Movie'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/movies')}
                        className="cancel-btn"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};
