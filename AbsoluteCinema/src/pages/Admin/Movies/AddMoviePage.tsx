import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { movieService } from '../../../api/movieService';
import './AddMoviePage.css';

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

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        genre: '',
        duration: '',
        format: '',
        ageLimit: '',
        year: '',
        country: '',
        directors: '',
        starring: '',
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
        
        // try {
        //     setSaving(true);
        //     setError(null);

        //     // Prepare data for API
        //     const movieData = {
        //         title: formData.title,
        //         description: formData.description,
        //         genre: formData.genre,
        //         duration: formData.duration,
        //         format: formData.format,
        //         ageLimit: parseInt(formData.ageLimit) || 0,
        //         year: parseInt(formData.year) || new Date().getFullYear(),
        //         country: formData.country,
        //         directors: formData.directors.split(',').map(d => d.trim()),
        //         starring: formData.starring.split(',').map(s => s.trim()),
        //         sessions: sessions.map(s => ({
        //             dateFrom: s.dateFrom,
        //             dateTo: s.dateTo,
        //             time: s.time,
        //             hall: s.hall,
        //             prices: {
        //                 average: parseFloat(s.averagePrice) || 0,
        //                 first3Row: parseFloat(s.first3RowPrice) || 0,
        //                 vip: parseFloat(s.vipPrice) || 0
        //             }
        //         }))
        //     };

        //     await movieService.createMovie(movieData);
        //     navigate('/admin/movies');
        // } catch (err) {
        //     setError('Failed to create movie. Please try again.');
        //     console.error('Create error:', err);
        // } finally {
        //     setSaving(false);
        // }
        
        // Using mock data
        setSaving(true);
        setTimeout(() => {
            console.log('Mock create:', formData, sessions);
            setSaving(false);
            navigate('/admin/movies');
        }, 500);
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
                {/* Movie Details Section */}
                <div className="form-section">
                    <h3>Movie Details</h3>
                    
                    <div className="form-columns">
                        <div className="form-left">
                            <div className="poster-upload">
                                <label htmlFor="poster" className="poster-upload-label">
                                    {formData.poster ? (
                                        <img 
                                            src={URL.createObjectURL(formData.poster)} 
                                            alt="Poster preview" 
                                            className="poster-preview"
                                        />
                                    ) : (
                                        <div className="poster-placeholder">
                                            <span className="upload-icon">↓</span>
                                            <span>Upload Poster</span>
                                        </div>
                                    )}
                                </label>
                                <input
                                    type="file"
                                    id="poster"
                                    accept="image/*"
                                    onChange={handlePosterChange}
                                    className="poster-input"
                                />
                            </div>
                        </div>

                        <div className="form-right">
                            <div className="form-group">
                                <label htmlFor="title">Movie Title *</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                    placeholder="Add Movie Title"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="form-input form-textarea"
                                    rows={3}
                                    placeholder="Add Text"
                                />
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label htmlFor="genre">Genre *</label>
                                    <input
                                        type="text"
                                        id="genre"
                                        name="genre"
                                        value={formData.genre}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                        placeholder="Add Text (input hint)"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="duration">Duration *</label>
                                    <input
                                        type="text"
                                        id="duration"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                        placeholder="Add Text"
                                    />
                                </div>
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label htmlFor="format">Format *</label>
                                    <input
                                        type="text"
                                        id="format"
                                        name="format"
                                        value={formData.format}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                        placeholder="Add Text"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="ageLimit">Age limit *</label>
                                    <input
                                        type="number"
                                        id="ageLimit"
                                        name="ageLimit"
                                        value={formData.ageLimit}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                        placeholder="Add Text"
                                        min="0"
                                        max="21"
                                    />
                                </div>
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label htmlFor="year">Year *</label>
                                    <input
                                        type="number"
                                        id="year"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                        placeholder="Add Text"
                                        min="1900"
                                        max="2100"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="country">Country *</label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                        placeholder="Add Text"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="directors">Director(s) *</label>
                                <input
                                    type="text"
                                    id="directors"
                                    name="directors"
                                    value={formData.directors}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                    placeholder="Add Text (comma separated)"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="starring">Starring *</label>
                                <input
                                    type="text"
                                    id="starring"
                                    name="starring"
                                    value={formData.starring}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                    placeholder="Add Text (comma separated)"
                                />
                            </div>

                            <button type="button" className="save-details-btn">
                                Save details
                            </button>
                        </div>
                    </div>
                </div>

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
