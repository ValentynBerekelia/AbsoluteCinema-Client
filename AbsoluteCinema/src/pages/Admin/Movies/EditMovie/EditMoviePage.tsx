import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './EditMoviePage.css';
import { MovieAddForm } from '../../../../components/MovieAddForm/MovieAddForm';
import { MovieFormData } from '../../../../types/CreateMovieRequest';
import { HallGrid } from '@/components/HallGrid/HallGrid';
import { TicketPriceManager } from '@/components/TicketPriceManager/TicketPriceManager';
import { MOCK_HALLS, MOCK_SEAT_TYPES } from '@/data/hallsData';
import { formatFullDuration } from '@/utils/timeFormat';
import inceptionPoster from '@/assets/posters/Inception3-2.jpg';
import interstellarPoster from '@/assets/posters/Interstellar3-2.jpg';
import matrixPoster from '@/assets/posters/matrix3-2.jpg';
import inceptionBanner from '@/assets/banners/Inception.jpg';
import interstellarBanner from '@/assets/banners/Interstellar.jpg';
import matrixBanner from '@/assets/banners/Matrix.jpg';
// import { getMovieById, updateMovie, updateSession } from '../../../../api/movies';

interface SessionFormData {
    id: string;
    date: string;
    time: string;
    hall: string;
    seatPrices: Record<string, string>;
    enabledTypes: Record<string, boolean>;
}

export const EditMoviePage = () => {
    const AVAILABLE_HALLS = MOCK_HALLS;
    const navigate = useNavigate();
    const { movieId } = useParams<{ movieId: string }>();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
    const [detailsOnly, setDetailsOnly] = useState(false);
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [mediaInput, setMediaInput] = useState('');
    const [trailerUrl, setTrailerUrl] = useState('');
    const [trailerInput, setTrailerInput] = useState('');

    const MOCK_MOVIES_BY_ID: Record<string, {
        title: string;
        description: string;
        rate: number;
        ageLimit: number;
        durationSeconds: number;
        country: string;
        studio: string;
        language: string;
        genres: string[];
        directors: string[];
        starring: string[];
        posterUrl: string;
        stills: string[];
        trailerUrl: string;
    }> = {
        '1': {
            title: 'Inception',
            description: 'A mind-bending thriller where dream invasion is possible.',
            rate: 8.7,
            ageLimit: 16,
            durationSeconds: 8880,
            country: 'USA',
            studio: 'Warner Bros.',
            language: 'English',
            genres: ['Sci-Fi', 'Action'],
            directors: ['Christopher Nolan'],
            starring: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt'],
            posterUrl: inceptionPoster,
            stills: [inceptionBanner, inceptionPoster, inceptionBanner],
            trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0'
        },
        '2': {
            title: 'Interstellar',
            description: 'Explorers travel through a wormhole in space in an attempt to save humanity.',
            rate: 8.6,
            ageLimit: 12,
            durationSeconds: 10140,
            country: 'USA',
            studio: 'Paramount Pictures',
            language: 'English',
            genres: ['Sci-Fi', 'Drama'],
            directors: ['Christopher Nolan'],
            starring: ['Matthew McConaughey', 'Anne Hathaway'],
            posterUrl: interstellarPoster,
            stills: [interstellarBanner, interstellarPoster, interstellarBanner],
            trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E'
        },
        '3': {
            title: 'The Matrix',
            description: 'A hacker discovers the reality he lives in is a simulated world.',
            rate: 8.7,
            ageLimit: 16,
            durationSeconds: 8160,
            country: 'USA',
            studio: 'Warner Bros.',
            language: 'English',
            genres: ['Sci-Fi', 'Action'],
            directors: ['Lana Wachowski', 'Lilly Wachowski'],
            starring: ['Keanu Reeves', 'Carrie-Anne Moss'],
            posterUrl: matrixPoster,
            stills: [matrixBanner, matrixPoster, matrixBanner],
            trailerUrl: 'https://www.youtube.com/watch?v=vKQi3bBA1y8'
        }
    };

    const [formData, setFormData] = useState<MovieFormData>({
        movieName: 'Edit Movie Title',
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
            date: '',
            time: '11:00',
            hall: '',
            seatPrices: {},
            enabledTypes: {}
        }
    ]);

    useEffect(() => {
        // Load movie data from API
        const loadMovieData = async () => {
            try {
                // TODO: Реалізувати API виклик для завантаження даних фільму
                // const movieData = await getMovieById(movieId);
                // 
                // setFormData({
                //     movieName: movieData.movieName,
                //     description: movieData.description,
                //     rate: movieData.rate,
                //     ageLimit: movieData.ageLimit,
                //     duration: movieData.duration,
                //     country: movieData.country,
                //     studio: movieData.studio,
                //     language: movieData.language,
                //     genres: movieData.genres,
                //     directors: movieData.directors,
                //     starring: movieData.starring,
                //     poster: null,
                //     posterUrl: movieData.posterUrl
                // });
                //
                // setSessions(movieData.sessions);
                //
                // setMediaUrls(movieData.imageUrls ?? []);
                // setTrailerUrl(movieData.trailerUrls?.[0] ?? '');
                const mockMovie = MOCK_MOVIES_BY_ID[movieId ?? '1'] ?? MOCK_MOVIES_BY_ID['1'];

                setFormData(prev => ({
                    ...prev,
                    movieName: mockMovie.title,
                    description: mockMovie.description,
                    rate: mockMovie.rate,
                    ageLimit: mockMovie.ageLimit,
                    duration: formatFullDuration(mockMovie.durationSeconds),
                    country: mockMovie.country,
                    studio: mockMovie.studio,
                    language: mockMovie.language,
                    genres: mockMovie.genres,
                    directors: mockMovie.directors,
                    starring: mockMovie.starring,
                    poster: null,
                    posterUrl: mockMovie.posterUrl
                }));
                setMediaUrls(mockMovie.stills);
                setTrailerUrl(mockMovie.trailerUrl);
            } catch (err) {
                setError('Failed to load movie data');
            }
        };

        if (movieId) {
            loadMovieData();
        }
    }, [movieId]);

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

    const handleSessionChange = (id: string, field: keyof SessionFormData, value: any) => {
        setSessions(prev => prev.map(session =>
            session.id === id ? { ...session, [field]: value } : session
        ));
    };

    const handleAddMedia = () => {
        const trimmed = mediaInput.trim();
        if (!trimmed) return;
        setMediaUrls(prev => [...prev, trimmed]);
        setMediaInput('');
    };

    const handleRemoveMedia = (index: number) => {
        setMediaUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveTrailer = () => {
        const trimmed = trailerInput.trim();
        if (!trimmed) return;
        setTrailerUrl(trimmed);
    };

    const handleRemoveTrailer = () => {
        setTrailerUrl('');
        setTrailerInput('');
    };

    const addSession = () => {
        const newSession: SessionFormData = {
            id: Date.now().toString(),
            date: '',
            time: '11:00',
            hall: '',
            seatPrices: {},
            enabledTypes: {}
        };
        setSessions(prev => [...prev, newSession]);
    };

    const removeSession = (id: string) => {
        if (sessions.length > 1) {
            setSessions(prev => prev.filter(session => session.id !== id));
        }
    };

    const handleSaveMovieDetailsOnly = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setDetailsOnly(true);
        setError(null);

        try {
            // TODO: Реалізувати API виклик для оновлення деталей фільму (без сесій)
            // const detailsPayload = {
            //     movieName: formData.movieName,
            //     description: formData.description,
            //     rate: formData.rate,
            //     ageLimit: formData.ageLimit,
            //     duration: formData.duration,
            //     country: formData.country,
            //     studio: formData.studio,
            //     language: formData.language,
            //     genres: formData.genres,
            //     directors: formData.directors,
            //     starring: formData.starring
            // };
            // 
            // await updateMovie(movieId, detailsPayload);
            //
            // TODO: API calls for media/trailer (commented for now)
            // if (movieId) {
            //     await createAndAttachMedia(movieId, { url: trailerUrl, type: MediaType.Trailer });
            //     await Promise.all(mediaUrls.map(url => createAndAttachMedia(movieId, { url, type: MediaType.Still })));
            // }
            setError(null);
            alert('Movie details saved successfully!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save movie details');
        } finally {
            setSaving(false);
            setDetailsOnly(false);
        }
    };

    const handleSaveSession = async (sessionId: string) => {
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        try {
            // TODO: Реалізувати API виклик для оновлення сесії
            // const prices = Object.keys(session.enabledTypes)
            //     .filter(typeId => session.enabledTypes[typeId] && session.seatPrices[typeId])
            //     .map(typeId => ({
            //         seatTypeId: typeId,
            //         price: Number(session.seatPrices[typeId] || 0)
            //     }));
            // 
            // await updateSession(sessionId, {
            //     date: session.date,
            //     time: session.time,
            //     hall: session.hall,
            //     prices: prices
            // });
            alert('Session updated successfully!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update session');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setDetailsOnly(false);
        setError(null);

        try {
            // TODO: Реалізувати API виклик для оновлення фільму зі всіма сесіями
            // const updatePayload = {
            //     movieName: formData.movieName,
            //     description: formData.description,
            //     rate: formData.rate,
            //     ageLimit: formData.ageLimit,
            //     duration: formData.duration,
            //     country: formData.country,
            //     studio: formData.studio,
            //     language: formData.language,
            //     genres: formData.genres,
            //     directors: formData.directors,
            //     starring: formData.starring,
            //     sessions: sessions.map(({ id, ...session }) => session)
            // };
            // 
            // await updateMovie(movieId, updatePayload);
            //
            // TODO: API calls for media/trailer (commented for now)
            // if (movieId) {
            //     await createAndAttachMedia(movieId, { url: trailerUrl, type: MediaType.Trailer });
            //     await Promise.all(mediaUrls.map(url => createAndAttachMedia(movieId, { url, type: MediaType.Still })));
            // }
            
            navigate('/admin/movies');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update movie');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="edit-movie-page">
            <div className="edit-movie-header">
                <h2>Edit Movie</h2>
                <button onClick={() => navigate('/admin/movies')} className="back-btn">
                    ← Back to Movies
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="edit-movie-form">
                {/* Movie Details Section */}
                <div className="movie-details-section">
                    <MovieAddForm formData={formData} setFormData={setFormData} />

                    {/* Details Save Button */}
                    <div className="details-save-actions">
                        <button 
                            type="button" 
                            onClick={handleSaveMovieDetailsOnly}
                            className="save-details-btn" 
                            disabled={saving && detailsOnly}
                        >
                            {saving && detailsOnly ? '💾 Saving...' : '💾 Save Movie Details Only'}
                        </button>
                        <p className="details-help-text">Save movie information without modifying sessions</p>
                    </div>
                </div>

                <div className="media-section">
                    <div className="media-section-header">
                        <h3>Media & Trailer</h3>
                        <p>Add stills and trailer URL for this movie (mock only).</p>
                    </div>

                    <div className="media-grid">
                        <div className="media-card">
                            <h4>Trailer</h4>
                            <div className="media-input-row">
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://youtube.com/..."
                                    value={trailerInput}
                                    onChange={(e) => setTrailerInput(e.target.value)}
                                    disabled={saving}
                                />
                                <button
                                    type="button"
                                    className="media-action-btn"
                                    onClick={handleSaveTrailer}
                                    disabled={saving || !trailerInput.trim()}
                                >
                                    Save
                                </button>
                            </div>
                            {trailerUrl ? (
                                <div className="media-preview">
                                    <span className="media-label">Current trailer:</span>
                                    <div className="media-preview-row">
                                        <a href={trailerUrl} target="_blank" rel="noreferrer">
                                            {trailerUrl}
                                        </a>
                                        <button
                                            type="button"
                                            className="media-remove-link"
                                            onClick={handleRemoveTrailer}
                                            disabled={saving}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="media-empty">No trailer added yet.</p>
                            )}
                        </div>

                        <div className="media-card">
                            <h4>Stills</h4>
                            <div className="media-input-row">
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://image.url/still.jpg"
                                    value={mediaInput}
                                    onChange={(e) => setMediaInput(e.target.value)}
                                    disabled={saving}
                                />
                                <button
                                    type="button"
                                    className="media-action-btn"
                                    onClick={handleAddMedia}
                                    disabled={saving || !mediaInput.trim()}
                                >
                                    Add
                                </button>
                            </div>

                            {mediaUrls.length > 0 ? (
                                <div className="media-preview-grid">
                                    {mediaUrls.map((url, index) => (
                                        <div key={`${url}-${index}`} className="media-preview-card">
                                            <img src={url} alt={`Still ${index + 1}`} />
                                            <button
                                                type="button"
                                                className="media-remove-btn"
                                                onClick={() => handleRemoveMedia(index)}
                                                disabled={saving}
                                                aria-label="Remove still"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="media-empty">No stills added yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sessions Section */}
                <div className="sessions-section">
                    <h3>Sessions & Pricing</h3>
                    <p className="sessions-info">Each session has a fixed date. Edit or delete individual sessions below.</p>

                    {sessions.length === 0 ? (
                        <div className="no-sessions-message">
                            <p>No sessions yet. Add one to get started.</p>
                        </div>
                    ) : (
                        <div className="sessions-list">
                            {sessions.map((session, index) => {
                                const selectedHall = AVAILABLE_HALLS.find(hall => hall.id === session.hall);
                                const isExpanded = expandedSessionId === session.id;

                                return (
                                    <div key={session.id} className="session-card">
                                        <div
                                            className="session-header"
                                            onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                                        >
                                            <div className="session-header-info">
                                                <h4>Session {index + 1}</h4>
                                                <span className="session-summary">
                                                    {session.date ? new Date(session.date).toLocaleDateString() : 'No date set'} • {session.time || 'No time'}
                                                    {selectedHall ? ` • ${selectedHall.name}` : ''}
                                                </span>
                                            </div>
                                            <div className="session-header-actions">
                                                <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                                                {sessions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeSession(session.id);
                                                        }}
                                                        className="remove-session-btn"
                                                        title="Delete this session"
                                                        disabled={saving}
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="session-content">
                                                <div className="date-range-inputs">
                                                    <div className="form-group">
                                                        <label>Date</label>
                                                        <input
                                                            type="date"
                                                            value={session.date}
                                                            onChange={(e) => handleSessionChange(session.id, 'date', e.target.value)}
                                                            className="form-input"
                                                            disabled={saving}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Time</label>
                                                        <input
                                                            type="time"
                                                            value={session.time}
                                                            onChange={(e) => handleSessionChange(session.id, 'time', e.target.value)}
                                                            className="form-input time-input"
                                                            disabled={saving}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="hall-selector">
                                                    <label>Hall:</label>
                                                    <select
                                                        value={session.hall}
                                                        onChange={(e) => handleSessionChange(session.id, 'hall', e.target.value)}
                                                        className="form-input hall-select"
                                                        disabled={saving}
                                                    >
                                                        <option value="">Select Hall</option>
                                                        {AVAILABLE_HALLS.map(hall => (
                                                            <option key={hall.id} value={hall.id}>{hall.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <HallGrid
                                                    seats={selectedHall?.seats || []}
                                                    enabledTypes={session.enabledTypes}
                                                    seatTypes={MOCK_SEAT_TYPES}
                                                />

                                                <TicketPriceManager
                                                    sessionId={session.id}
                                                    seatTypes={MOCK_SEAT_TYPES}
                                                    enabledTypes={session.enabledTypes}
                                                    seatPrices={session.seatPrices}
                                                    onPriceChange={(typeId, field, value) => {
                                                        const subField: 'enabledTypes' | 'seatPrices' = field === 'enabled' ? 'enabledTypes' : 'seatPrices';
                                                        handleSessionChange(session.id, subField, {
                                                            ...session[subField],
                                                            [typeId]: value
                                                        });
                                                    }}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveSession(session.id)}
                                                    className="save-session-btn"
                                                    disabled={saving}
                                                >
                                                    {saving ? 'Saving...' : 'Save sessions and price'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={addSession}
                        className="add-session-btn"
                        disabled={saving}
                    >
                        + Add Session
                    </button>
                </div>

                {/* Submit */}
                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="submit-btn primary" 
                        disabled={saving && !detailsOnly}
                    >
                        {saving && !detailsOnly ? '⏳ Updating...' : '✓ Update Movie & All Sessions'}
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
