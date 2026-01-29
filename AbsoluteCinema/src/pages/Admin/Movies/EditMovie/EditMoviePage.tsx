import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './EditMoviePage.css';
import { MovieAddForm } from '../../../../components/MovieAddForm/MovieAddForm';
import { CreateMovieRequest, MovieFormData } from '../../../../types/CreateMovieRequest';
import { SessionFormData } from '../../../../types/SessionRequest';
import { updateMovie, getMovieById, getMovieSessions, updateSession, deleteSession, createSession } from '../../../../api/movies';
// import { getSeatTypes } from '../../../../api/seatTypeService';
import { SeatType } from '../../../../types/SeatType';

// Mock seat types
const MOCK_SEAT_TYPES: SeatType[] = [
    { id: '1', name: 'Comfort' },
    { id: '2', name: 'Vip' },
    { id: '3', name: 'Standart' },
    { id: '4', name: 'Disabled' },
    { id: '5', name: 'Broken' }
];

export const EditMoviePage = () => {
    const navigate = useNavigate();
    const { movieId } = useParams<{ movieId: string }>();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
    const [loadingSeatTypes, setLoadingSeatTypes] = useState(true);
    const [selectedSeatType, setSelectedSeatType] = useState<string>('');

    const [formData, setFormData] = useState<MovieFormData>({
        movieName: '',
        description: '',
        rate: 0,
        ageLimit: 0,
        durationSeconds: 0,
        country: '',
        studio: '',
        language: '',
        genres: [],
        directors: [],
        starring: [],
        poster: null as File | null
    });

    const [sessions, setSessions] = useState<(SessionFormData & { apiId?: string; isNew?: boolean; seats?: { [seatIndex: number]: string } })[]>([]);

    // Load seat types
    useEffect(() => {
        // const loadSeatTypes = async () => {
        //     try {
        //         const types = await getSeatTypes();
        //         setSeatTypes(types);
        //     } catch (err) {
        //         console.error('Failed to load seat types:', err);
        //     } finally {
        //         setLoadingSeatTypes(false);
        //     }
        // };
        
        // loadSeatTypes();
        
        // Use mock data instead
        setSeatTypes(MOCK_SEAT_TYPES);
        setLoadingSeatTypes(false);
    }, []);

    // Load movie data
    useEffect(() => {
        const loadMovie = async () => {
            if (!movieId) {
                setError('Movie ID not provided');
                setLoading(false);
                return;
            }

            try {
                const movieData = await getMovieById(movieId);
                setFormData({
                    movieName: movieData.name || '',
                    description: movieData.description || '',
                    rate: movieData.rate || 0,
                    ageLimit: movieData.ageLimit || 0,
                    durationSeconds: movieData.durationSeconds || 0,
                    country: movieData.country || '',
                    studio: movieData.studio || '',
                    language: movieData.language || '',
                    genres: movieData.genres || [],
                    directors: movieData.persons || [],
                    starring: movieData.persons || [],
                    poster: null
                });

                // Load sessions
                const sessionsData = await getMovieSessions(movieId);
                if (sessionsData.sessions && Array.isArray(sessionsData.sessions)) {
                    const formattedSessions = sessionsData.sessions.map((session: any) => {
                        const dateTime = new Date(session.startDateTime);
                        const date = dateTime.toISOString().split('T')[0];
                        const time = dateTime.toTimeString().slice(0, 5);
                        
                        // Extract seat type prices
                        const seatTypePrices: { [key: string]: string } = {};
                        if (session.seatTypePrices && Array.isArray(session.seatTypePrices)) {
                            session.seatTypePrices.forEach((stp: any) => {
                                seatTypePrices[stp.seatTypeId] = stp.price.toString();
                            });
                        }
                        
                        // Extract seat types (if available from API)
                        const seats: { [key: number]: string } = {};
                        if (session.seats && Array.isArray(session.seats)) {
                            session.seats.forEach((seat: any, index: number) => {
                                if (seat.seatTypeId) {
                                    seats[index] = seat.seatTypeId;
                                }
                            });
                        }
                        
                        return {
                            id: session.id,
                            apiId: session.id,
                            date: date,
                            time: time,
                            hall: session.hallId || '',
                            seatTypePrices: seatTypePrices,
                            seats: seats,
                            isNew: false
                        };
                    });
                    setSessions(formattedSessions);
                }
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to load movie');
            } finally {
                setLoading(false);
            }
        };

        loadMovie();
    }, [movieId]);

    const handleSessionChange = (id: string, field: keyof Omit<SessionFormData, 'seatTypePrices'>, value: string) => {
        setSessions(prev => prev.map(session =>
            session.id === id ? { ...session, [field]: value } : session
        ));
    };

    const handleSeatTypePriceChange = (sessionId: string, seatTypeId: string, price: string) => {
        setSessions(prev => prev.map(session =>
            session.id === sessionId 
                ? { ...session, seatTypePrices: { ...session.seatTypePrices, [seatTypeId]: price } }
                : session
        ));
    };

    const addSession = () => {
        const newSession: SessionFormData & { isNew: boolean; seats: { [seatIndex: number]: string } } = {
            id: Date.now().toString(),
            date: '',
            time: '11:00',
            hall: '',
            seatTypePrices: seatTypes.reduce((acc, type) => {
                acc[type.id] = '';
                return acc;
            }, {} as { [key: string]: string }),
            seats: {},
            isNew: true
        };
        setSessions(prev => [...prev, newSession]);
    };

    const handleSeatClick = (sessionId: string, seatIndex: number) => {
        if (!selectedSeatType) {
            alert('Please select a seat type from the legend first');
            return;
        }
        setSessions(prev => prev.map(session =>
            session.id === sessionId
                ? { ...session, seats: { ...(session.seats || {}), [seatIndex]: selectedSeatType } }
                : session
        ));
    };

    const getSeatColor = (seatTypeId: string) => {
        switch(seatTypeId) {
            case '1': return '#90EE90'; // Comfort - light green
            case '2': return '#FFD700'; // Vip - gold
            case '3': return '#87CEEB'; // Standart - sky blue
            case '4': return '#FFA500'; // Disabled - orange
            case '5': return '#FF6B6B'; // Broken - red
            default: return '#ffffff';
        }
    };

    const removeSession = (id: string) => {
        setSessions(prev => prev.filter(session => session.id !== id));
    };

    // Helper function to convert date + time to ISO datetime
    const createDateTime = (date: string, time: string): string => {
        if (!date || !time) {
            throw new Error('Date and time are required');
        }
        return `${date}T${time}:00`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (!movieId) {
                setError('Movie ID not provided');
                return;
            }

            const moviePayload: CreateMovieRequest = {
                name: formData.movieName,
                description: formData.description,
                rate: formData.rate,
                ageLimit: formData.ageLimit,
                durationSeconds: formData.durationSeconds,
                country: formData.country,
                studio: formData.studio,
                language: formData.language,
                genreIds: []
            };

            await updateMovie(movieId, moviePayload);
            console.log('Movie updated with ID:', movieId);

            // Update sessions
            for (const session of sessions) {
                if (session.date && session.time && session.hall) {
                    try {
                        const startDateTime = createDateTime(session.date, session.time);
                        
                        // Prepare seat type prices
                        const seatTypePrices = Object.entries(session.seatTypePrices)
                            .filter(([_, price]) => price && parseFloat(price) > 0)
                            .map(([seatTypeId, price]) => ({
                                seatTypeId,
                                price: parseFloat(price)
                            }));
                        
                        if (session.isNew) {
                            // Create new session
                            await createSession({
                                movieId: movieId,
                                hallId: session.hall,
                                startDateTime: startDateTime,
                                seatTypePrices: seatTypePrices.length > 0 ? seatTypePrices : undefined
                            });
                        } else if (session.apiId) {
                            // Update existing session
                            await updateSession(session.apiId, {
                                hallId: session.hall,
                                startDateTime: startDateTime,
                                seatTypePrices: seatTypePrices.length > 0 ? seatTypePrices : undefined
                            });
                        }
                    } catch (sessionError) {
                        console.error('Failed to save session:', sessionError);
                    }
                }
            }

            navigate('/admin/movies');
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to update movie');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveMovieDetails = async () => {
        setSaving(true);
        setError(null);

        try {
            if (!movieId) {
                setError('Movie ID not provided');
                return;
            }

            const moviePayload: CreateMovieRequest = {
                name: formData.movieName,
                description: formData.description,
                rate: formData.rate,
                ageLimit: formData.ageLimit,
                durationSeconds: formData.durationSeconds,
                country: formData.country,
                studio: formData.studio,
                language: formData.language,
                genreIds: []
            };

            await updateMovie(movieId, moviePayload);
            console.log('Movie details updated successfully');
            alert('Movie details saved successfully!');
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to update movie details');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSessions = async () => {
        setSaving(true);
        setError(null);

        try {
            if (!movieId) {
                setError('Movie ID not provided');
                return;
            }

            // Update sessions
            for (const session of sessions) {
                if (session.date && session.time && session.hall) {
                    try {
                        const startDateTime = createDateTime(session.date, session.time);
                        
                        // Prepare seat type prices
                        const seatTypePrices = Object.entries(session.seatTypePrices)
                            .filter(([_, price]) => price && parseFloat(price) > 0)
                            .map(([seatTypeId, price]) => ({
                                seatTypeId,
                                price: parseFloat(price)
                            }));
                        
                        if (session.isNew) {
                            // Create new session
                            await createSession({
                                movieId: movieId,
                                hallId: session.hall,
                                startDateTime: startDateTime,
                                seatTypePrices: seatTypePrices.length > 0 ? seatTypePrices : undefined
                            });
                        } else if (session.apiId) {
                            // Update existing session
                            await updateSession(session.apiId, {
                                hallId: session.hall,
                                startDateTime: startDateTime,
                                seatTypePrices: seatTypePrices.length > 0 ? seatTypePrices : undefined
                            });
                        }
                    } catch (sessionError) {
                        console.error('Failed to save session:', sessionError);
                    }
                }
            }

            console.log('Sessions updated successfully');
            alert('Sessions saved successfully!');
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to update sessions');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="edit-movie-page"><p>Loading...</p></div>;
    }

    return (
        <div className="edit-movie-page">
            <div className="edit-movie-header">
                <h2>Edit Movie</h2>
                <button onClick={() => navigate('/admin/movies')} className="back-btn">
                    Back to Movies
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="edit-movie-form">
                <MovieAddForm formData={formData} setFormData={setFormData} />

                {/* Save Movie Details Button */}
                <div className="form-section-actions">
                    <button 
                        type="button" 
                        onClick={handleSaveMovieDetails} 
                        className="save-details-btn"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Movie Details'}
                    </button>
                </div>

                {/* Sessions Section */}
                <div className="form-section sessions-section">
                    <h3>Sessions & Pricing</h3>

                    {sessions.length > 0 ? (
                        <>
                            {sessions.map((session, index) => (
                                <div key={session.id} className="session-card">
                                    <div className="session-header">
                                        <h4>Session {index + 1}</h4>
                                    {sessions.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSession(session.id)}
                                                className="remove-session-btn"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    <div className="session-details">
                                        <div className="session-date-time">
                                            <div className="form-group">
                                                <label>Date</label>
                                                <input
                                                    type="date"
                                                    value={session.date}
                                                    onChange={(e) => handleSessionChange(session.id, 'date', e.target.value)}
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
                                                <option value="">Select Hall</option>
                                                <option value="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa">Grand Hall</option>
                                                <option value="bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb">Blue Room</option>
                                                <option value="cccccccc-cccc-cccc-cccc-cccccccccccc">IMAX Premium</option>
                                                <option value="dddddddd-dddd-dddd-dddd-dddddddddddd">Hall 3</option>
                                                <option value="eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee">Retro Cinema</option>
                                            </select>
                                        </div>

                                        <div className="seat-legend">
                                            <span style={{ marginRight: '10px', fontWeight: 600 }}>Select type:</span>
                                            {seatTypes.map(type => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    className={`legend-button ${selectedSeatType === type.id ? 'active' : ''}`}
                                                    onClick={() => setSelectedSeatType(type.id)}
                                                    style={{
                                                        backgroundColor: selectedSeatType === type.id ? getSeatColor(type.id) : 'white',
                                                        borderColor: getSeatColor(type.id)
                                                    }}
                                                >
                                                    <span className="legend-label">{type.name.charAt(0)}</span>
                                                    <span className="legend-text">{type.name}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="seats-grid">
                                            {Array.from({ length: 60 }).map((_, i) => {
                                                const seatTypeId = session.seats?.[i];
                                                const seatType = seatTypes.find(t => t.id === seatTypeId);
                                                return (
                                                    <div
                                                        key={i}
                                                        className="seat-item"
                                                        onClick={() => handleSeatClick(session.id, i)}
                                                        style={{
                                                            backgroundColor: seatTypeId ? getSeatColor(seatTypeId) : '#ffffff',
                                                            cursor: 'pointer'
                                                        }}
                                                        title={seatType ? `Seat ${i + 1}: ${seatType.name}` : `Seat ${i + 1}: Empty`}
                                                    >
                                                        {seatType ? seatType.name.charAt(0) : '-'}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="ticket-prices">
                                            <h5>Ticket prices</h5>
                                            {loadingSeatTypes ? (
                                                <div>Loading seat types...</div>
                                            ) : (
                                                <div className="prices-row">
                                                    {seatTypes.map((seatType) => (
                                                        <div className="form-group" key={seatType.id}>
                                                            <label>{seatType.name}:</label>
                                                            <input
                                                                type="number"
                                                                value={session.seatTypePrices[seatType.id] || ''}
                                                                onChange={(e) => handleSeatTypePriceChange(session.id, seatType.id, e.target.value)}
                                                                className="form-input price-input"
                                                                placeholder="Price"
                                                                step="0.01"
                                                                min="0"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <button type="button" className="save-session-btn">
                                            Save Session
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button type="button" onClick={addSession} className="add-session-btn">
                                + Add Session
                            </button>

                            {/* Save Sessions Button */}
                            <div className="form-section-actions" style={{ marginTop: '20px' }}>
                                <button 
                                    type="button" 
                                    onClick={handleSaveSessions} 
                                    className="save-sessions-btn"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save All Sessions'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="no-sessions">
                            <p>No sessions yet</p>
                            <button type="button" onClick={addSession} className="add-session-btn">
                                + Add First Session
                            </button>
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={saving}>
                        {saving ? 'Saving All...' : 'Save All & Close'}
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
