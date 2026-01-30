import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { movieService } from '../../../api/movieService';
import './AddMoviePage.css';
import { MovieAddForm } from '../../../../components/MovieAddForm/MovieAddForm';
import { CreateMovieRequest, MovieFormData } from '../../../../types/CreateMovieRequest';
import { createMovie } from '../../../../api/movies';
import { SessionManager } from '@/components/SessionManager/SessionManager';
import { MOCK_HALLS, MOCK_SEAT_TYPES } from '@/data/hallsData';
import { getDatesInRange } from '@/utils/getDatesInRange';
import { createSession } from '@/api';

interface SessionFormData {
    id: string;
    dateFrom: string;
    dateTo: string;
    time: string;
    hall: string;
    seatPrices: Record<string, string>;
    enabledTypes: Record<string, boolean>;
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
            seatPrices: {},
            enabledTypes: {},
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
            seatPrices: {},
            enabledTypes: {},
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
                rate: Number(formData.rate),
                ageLimit: Number(formData.ageLimit),
                duration: formData.duration,
                country: formData.country,
                studio: formData.studio,
                language: formData.language,
                genres: formData.genres
            };

            const movieResult = await createMovie(moviePayload as any);
            const newMovieId = movieResult.movieId.id ?? movieResult.id;
            console.log(movieResult);

            for (const sessionCard of sessions) {
                if (!sessionCard.hall) continue;

                const dates = getDatesInRange(sessionCard.dateFrom, sessionCard.dateTo);

                const prices = Object.keys(sessionCard.enabledTypes)
                    .filter(typeId => sessionCard.enabledTypes[typeId] && sessionCard.seatPrices[typeId])
                    .map(typeId => ({
                        seatTypeId: typeId,
                        price: Number(sessionCard.seatPrices[typeId] || 0)
                    }));

                if (prices.length === 0) {
                    console.warn('No prices configured for session, skipping...');
                    continue;
                }

                const sessionRequests = dates.map(date => ({
                    movieId: newMovieId,
                    hallId: sessionCard.hall,
                    format: 2,
                    startTime: `${date}T${sessionCard.time}:00.000Z`,
                    prices: prices,
                }));

                try {
                    await Promise.all(sessionRequests.map(req => createSession(req)));
                } catch (sessionError: any) {
                    console.error('Session creation failed:', sessionError);
                    setError(`Session creation failed: ${sessionError.response?.data?.detail || sessionError.message}`);
                    throw sessionError;
                }
            }

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
