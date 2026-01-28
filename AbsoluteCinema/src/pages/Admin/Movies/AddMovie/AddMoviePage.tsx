import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { movieService } from '../../../api/movieService';
import './AddMoviePage.css';
import { MovieAddForm } from '../../../../components/MovieAddForm/MovieAddForm';
import { CreateMovieRequest, MovieFormData } from '../../../../types/CreateMovieRequest';
import { createMovie } from '../../../../api/movies';

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
                <div className="form-section sessions-section">
                    <h3>Sessions & Pricing</h3>

                    {sessions.map((session, index) => (
                        <div key={session.id} className="session-card">
                            <div className="session-header">
                                <h4>Session {index + 1}</h4>
                                {sessions.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSession(session.id)}
                                        className="remove-session-btn"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            <div className="session-dates">
                                <div className="form-group">
                                    <label>From [date range]</label>
                                    <input
                                        type="date"
                                        value={session.dateFrom}
                                        onChange={(e) => handleSessionChange(session.id, 'dateFrom', e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>to [date range]</label>
                                    <input
                                        type="date"
                                        value={session.dateTo}
                                        onChange={(e) => handleSessionChange(session.id, 'dateTo', e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <input
                                        type="time"
                                        value={session.time}
                                        onChange={(e) => handleSessionChange(session.id, 'time', e.target.value)}
                                        className="form-input time-input"
                                    />
                                </div>
                            </div>

                            <div className="hall-selector">
                                <label>Hall:</label>
                                <select
                                    value={session.hall}
                                    onChange={(e) => handleSessionChange(session.id, 'hall', e.target.value)}
                                    className="form-input hall-select"
                                >
                                    <option value="">HallName</option>
                                    <option value="Grand Hall">Grand Hall</option>
                                    <option value="Blue Room">Blue Room</option>
                                    <option value="IMAX Premium">IMAX Premium</option>
                                    <option value="Hall 3">Hall 3</option>
                                    <option value="Retro Cinema">Retro Cinema</option>
                                </select>
                            </div>

                            <div className="seats-grid">
                                {Array.from({ length: 60 }).map((_, i) => (
                                    <div key={i} className="seat-placeholder"></div>
                                ))}
                            </div>

                            <div className="ticket-prices">
                                <h5>Ticket prices</h5>
                                <div className="prices-row">
                                    <div className="form-group">
                                        <label>Average:</label>
                                        <input
                                            type="number"
                                            value={session.averagePrice}
                                            onChange={(e) => handleSessionChange(session.id, 'averagePrice', e.target.value)}
                                            className="form-input price-input"
                                            placeholder="Add Text"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <input type="checkbox" id={`first3-${session.id}`} />
                                        <label htmlFor={`first3-${session.id}`}>First 3 row:</label>
                                        <input
                                            type="number"
                                            value={session.first3RowPrice}
                                            onChange={(e) => handleSessionChange(session.id, 'first3RowPrice', e.target.value)}
                                            className="form-input price-input"
                                            placeholder="Add Text"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <input type="checkbox" id={`vip-${session.id}`} />
                                        <label htmlFor={`vip-${session.id}`}>VIP:</label>
                                        <input
                                            type="number"
                                            value={session.vipPrice}
                                            onChange={(e) => handleSessionChange(session.id, 'vipPrice', e.target.value)}
                                            className="form-input price-input"
                                            placeholder="Add Text"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="button" className="save-session-btn">
                                Save sessions and price
                            </button>
                        </div>
                    ))}

                    <button type="button" onClick={addSession} className="add-session-btn">
                        +
                    </button>
                </div>

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
