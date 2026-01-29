import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddMoviePage.css';
import { MovieAddForm } from '../../../../components/MovieAddForm/MovieAddForm';
import { CreateMovieRequest, MovieFormData } from '../../../../types/CreateMovieRequest';
import { createMovie, createSession } from '../../../../api/movies';
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

interface SessionRangeFormData {
    id: string;
    dateFrom: string;
    dateTo: string;
    time: string;
    hall: string;
    seatTypePrices: { [seatTypeId: string]: string };
    seats: { [seatIndex: number]: string }; // seat index -> seat type id
}

export const AddMoviePage = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
    const [loadingSeatTypes, setLoadingSeatTypes] = useState(true);
    const [selectedSeatType, setSelectedSeatType] = useState<string>('');

    const [formData, setFormData] = useState<MovieFormData>({
        movieName: 'Add Movie Title',
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

    const [sessions, setSessions] = useState<SessionRangeFormData[]>([
        {
            id: '1',
            dateFrom: '',
            dateTo: '',
            time: '11:00',
            hall: '',
            seatTypePrices: {},
            seats: {}
        }
    ]);

    // Load seat types on component mount
    useEffect(() => {
        // const loadSeatTypes = async () => {
        //     try {
        //         const types = await getSeatTypes();
        //         setSeatTypes(types);
                
        //         // Initialize seatTypePrices for existing sessions
        //         setSessions(prev => prev.map(session => ({
        //             ...session,
        //             seatTypePrices: types.reduce((acc, type) => {
        //                 acc[type.id] = session.seatTypePrices[type.id] || '';
        //                 return acc;
        //             }, {} as { [key: string]: string })
        //         })));
        //     } catch (err) {
        //         console.error('Failed to load seat types:', err);
        //         setError('Failed to load seat types');
        //     } finally {
        //         setLoadingSeatTypes(false);
        //     }
        // };
        
        // loadSeatTypes();
        
        // Use mock data instead
        setSeatTypes(MOCK_SEAT_TYPES);
        setSessions(prev => prev.map(session => ({
            ...session,
            seatTypePrices: MOCK_SEAT_TYPES.reduce((acc, type) => {
                acc[type.id] = session.seatTypePrices[type.id] || '';
                return acc;
            }, {} as { [key: string]: string }),
            seats: session.seats || {}
        })));
        setLoadingSeatTypes(false);
    }, []);

    const handleSessionChange = (id: string, field: keyof Omit<SessionRangeFormData, 'seatTypePrices'>, value: string) => {
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
        const newSession: SessionRangeFormData = {
            id: Date.now().toString(),
            dateFrom: '',
            dateTo: '',
            time: '11:00',
            hall: '',
            seatTypePrices: seatTypes.reduce((acc, type) => {
                acc[type.id] = '';
                return acc;
            }, {} as { [key: string]: string }),
            seats: {}
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
                ? { ...session, seats: { ...session.seats, [seatIndex]: selectedSeatType } }
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
        if (sessions.length > 1) {
            setSessions(prev => prev.filter(session => session.id !== id));
        }
    };

    // Helper function to generate array of dates between dateFrom and dateTo
    const generateDateRange = (dateFrom: string, dateTo: string): string[] => {
        const dates: string[] = [];
        const start = new Date(dateFrom);
        const end = new Date(dateTo);
        
        if (start > end) {
            return [dateFrom]; // якщо dateFrom більше dateTo, повертаємо тільки dateFrom
        }
        
        const current = new Date(start);
        while (current <= end) {
            dates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }
        
        return dates;
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
            // Create movie first
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

            const movieResult = await createMovie(moviePayload);
            const movieId = movieResult.id;
            console.log('Movie created with ID:', movieId);

            // Create sessions for the movie
            for (const sessionRange of sessions) {
                if (sessionRange.dateFrom && sessionRange.dateTo && sessionRange.time && sessionRange.hall) {
                    try {
                        // Генеруємо масив дат між dateFrom і dateTo
                        const dates = generateDateRange(sessionRange.dateFrom, sessionRange.dateTo);
                        
                        // Prepare seat type prices
                        const seatTypePrices = Object.entries(sessionRange.seatTypePrices)
                            .filter(([_, price]) => price && parseFloat(price) > 0)
                            .map(([seatTypeId, price]) => ({
                                seatTypeId,
                                price: parseFloat(price)
                            }));
                        
                        // Створюємо окремий сеанс для кожної дати
                        for (const date of dates) {
                            const startDateTime = createDateTime(date, sessionRange.time);
                            await createSession({
                                movieId: movieId,
                                hallId: sessionRange.hall,
                                startDateTime: startDateTime,
                                seatTypePrices: seatTypePrices.length > 0 ? seatTypePrices : undefined
                            });
                        }
                    } catch (sessionError) {
                        console.error('Failed to create sessions:', sessionError);
                    }
                }
            }

            navigate('/admin/movies');
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to create movie');
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

                            <div className="session-details">
                                <div className="session-date-range">
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
                                        const seatTypeId = session.seats[i];
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
                                    Save Session Range
                                </button>
                            </div>
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
