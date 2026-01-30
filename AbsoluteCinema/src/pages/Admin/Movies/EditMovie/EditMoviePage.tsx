import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './EditMoviePage.css';
import { MovieAddForm } from '../../../../components/MovieAddForm/MovieAddForm';
import { MovieFormData } from '../../../../types/CreateMovieRequest';
import { HallGrid } from '@/components/HallGrid/HallGrid';
import { TicketPriceManager } from '@/components/TicketPriceManager/TicketPriceManager';
import { MOCK_HALLS, MOCK_SEAT_TYPES } from '@/data/hallsData';
import { formatFullDuration } from '@/utils/timeFormat';
import { getMovieById, updateMovie, updateMoviePartial, createAndAttachMedia, deleteMedia, MediaType } from '@/api/movies';
import { getMovieSessions, updateSessionPartial, createSession } from '@/api/sessions';
import { getHalls, getHallById } from '@/api/halls';
import inceptionPoster from '@/assets/posters/Inception3-2.jpg';
import interstellarPoster from '@/assets/posters/Interstellar3-2.jpg';
import matrixPoster from '@/assets/posters/matrix3-2.jpg';
import inceptionBanner from '@/assets/banners/Inception.jpg';
import interstellarBanner from '@/assets/banners/Interstellar.jpg';
import matrixBanner from '@/assets/banners/Matrix.jpg';

interface SessionFormData {
    id: string;
    date: string;
    time: string;
    hall: string;
    seatPrices: Record<string, string>;
    enabledTypes: Record<string, boolean>;
}

interface MediaItem {
    id: string;
    url: string;
    type: MediaType;
}

// Convert HH:MM:SS to minutes
const convertTimeSpanToMinutes = (timeSpan: string): string => {
    const match = timeSpan.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
    if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        return String(hours * 60 + minutes);
    }
    return timeSpan; // Return as-is if not in HH:MM:SS format
};

const calculateDurationSeconds = (durationString: string): number => {
    // Parse duration in formats: "HH:MM:SS" or "2 h 28 min" or "148 min" or just "40" (assume minutes)
    console.log('🕐 Parsing duration string:', durationString);
    
    if (!durationString || durationString.trim() === '') {
        console.warn('⚠️ Duration string is empty');
        return 0;
    }
    
    // First, try to parse HH:MM:SS format (e.g., "00:40:00")
    const timeMatch = durationString.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
    if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const seconds = parseInt(timeMatch[3], 10);
        const result = hours * 3600 + minutes * 60 + seconds;
        console.log(`📝 Parsed HH:MM:SS: ${hours}h ${minutes}m ${seconds}s = ${result}s`);
        return result;
    }
    
    // Try to parse as formatted string (e.g., "2 h 28 min")
    const hoursMatch = durationString.match(/(\d+)\s*h/);
    const minutesMatch = durationString.match(/(\d+)\s*min/);
    
    if (hoursMatch || minutesMatch) {
        let hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
        let minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
        const result = hours * 3600 + minutes * 60;
        console.log(`📝 Parsed formatted: ${hours}h ${minutes}min = ${result}s`);
        return result;
    }
    
    // Try to parse as plain number (assume minutes)
    const plainNumber = parseInt(durationString.trim(), 10);
    if (!isNaN(plainNumber) && plainNumber > 0) {
        const result = plainNumber * 60;
        console.log(`📝 Parsed as minutes: ${plainNumber}min = ${result}s`);
        return result;
    }
    
    console.error('❌ Could not parse duration:', durationString);
    return 0;
};

export const EditMoviePage = () => {
    const [halls, setHalls] = useState<any[]>([]);
    const [seatTypes, setSeatTypes] = useState<any[]>([]);
    const AVAILABLE_HALLS = halls.length > 0 ? halls : MOCK_HALLS;
    const AVAILABLE_SEAT_TYPES = seatTypes.length > 0 ? seatTypes : MOCK_SEAT_TYPES;
    const navigate = useNavigate();
    const { movieId } = useParams<{ movieId: string }>();
    const safeMovieId = movieId ?? '';
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
    const [detailsOnly, setDetailsOnly] = useState(false);
    const [savingMedia, setSavingMedia] = useState(false);
    
    // Media state
    const [stills, setStills] = useState<MediaItem[]>([]);
    const [trailer, setTrailer] = useState<MediaItem | null>(null);
    const [stillInput, setStillInput] = useState('');
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
                const movieData = await getMovieById(movieId ?? '');
                console.log('Raw API response:', movieData);
                console.log('Duration from API:', movieData.duration);
                
                // Convert duration from HH:MM:SS to minutes for display
                const durationInMinutes = movieData.duration ? convertTimeSpanToMinutes(movieData.duration) : '';
                console.log('Duration in minutes:', durationInMinutes);
                
                setFormData(prev => ({
                    ...prev,
                    movieName: movieData.movieName || movieData.title || '',
                    description: movieData.description || '',
                    rate: movieData.rate || 0,
                    ageLimit: movieData.ageLimit || 0,
                    duration: durationInMinutes,
                    country: movieData.country || '',
                    studio: movieData.studio || '',
                    language: movieData.language || '',
                    genres: movieData.genres || [],
                    directors: movieData.directors || [],
                    starring: movieData.starring || [],
                    poster: null,
                    posterUrl: movieData.posterUrl || movieData.posterImage?.url || ''
                }));
                
                // Load media from API - parse imageUrls and trailerUrls with their IDs
                const stills: MediaItem[] = [];
                let trailer: MediaItem | null = null;

                console.log('Trying to load imageUrls:', movieData.imageUrls);
                console.log('Trying to load imageIds:', movieData.imageIds);
                console.log('Trying to load trailerUrls:', movieData.trailerUrls);
                console.log('Trying to load trailerIds:', movieData.trailerIds);

                // Load stills from imageUrls with their real IDs (array)
                if (movieData.imageUrls && Array.isArray(movieData.imageUrls)) {
                    console.log('Found imageUrls, mapping to stills');
                    stills.push(...movieData.imageUrls.map((url: string, idx: number) => ({
                        // Use real ImageId from API, fallback to generated ID if not available
                        id: movieData.imageIds?.[idx] || `image-${idx}`,
                        url,
                        type: MediaType.Image
                    })));
                }

                // Load trailer from trailerUrls (array - take ONLY first one)
                if (movieData.trailerUrls && Array.isArray(movieData.trailerUrls) && movieData.trailerUrls.length > 0) {
                    trailer = {
                        // Use real trailerId from trailerIds array
                        id: movieData.trailerIds?.[0] || 'trailer-0',
                        url: movieData.trailerUrls[0],
                        type: MediaType.Video
                    };
                }

                setStills(stills);
                if (trailer) {
                    setTrailer(trailer);
                    setTrailerInput(trailer.url);
                }

                // Log loaded media for debugging
                console.log('Loaded media from API:', { stills, trailer });

                // Load sessions from API
                try {
                    const sessionsData = await getMovieSessions(movieId ?? '');
                    console.log('Loaded sessions from API:', sessionsData);
                    
                    if (sessionsData && Array.isArray(sessionsData) && sessionsData.length > 0) {
                        const loadedSessions = sessionsData.map((session: any) => ({
                            id: session.id || session.sessionId,
                            date: session.startDateTime?.split('T')[0] || '',
                            time: session.startDateTime?.split('T')[1]?.substring(0, 5) || '',
                            hall: session.hallId?.id || session.hallId || '',
                            seatPrices: session.prices?.reduce((acc: any, p: any) => {
                                acc[p.seatTypeId] = String(p.price);
                                return acc;
                            }, {}) || {},
                            enabledTypes: session.prices?.reduce((acc: any, p: any) => {
                                acc[p.seatTypeId] = true;
                                return acc;
                            }, {}) || {}
                        }));
                        setSessions(loadedSessions);
                    }
                } catch (sessionErr) {
                    console.error('Failed to load sessions:', sessionErr);
                    // Keep default empty session if loading fails
                }
            } catch (err) {
                console.error('Failed to load movie data:', err);
                setError('Failed to load movie data');
                // Fallback to mock data for development
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
                // Load mock stills and trailer
                const mockStills = mockMovie.stills.map((url, idx) => ({
                    id: `mock-still-${idx}`,
                    url,
                    type: MediaType.Image
                }));
                const mockTrailer = {
                    id: 'mock-trailer',
                    url: mockMovie.trailerUrl,
                    type: MediaType.Video
                };
                setStills(mockStills);
                setTrailer(mockTrailer);
                setTrailerInput(mockMovie.trailerUrl);
                setTrailerInput(mockMovie.trailerUrl);
            }
        };

        if (movieId) {
            loadMovieData();
        }
    }, [movieId]);

    // Load halls from API
    useEffect(() => {
        const loadHalls = async () => {
            try {
                const hallsData = await getHalls();
                console.log('🏛️ Loaded halls from API:', hallsData);
                console.log('🏛️ Halls data type:', typeof hallsData);
                
                // API returns { halls: [...] }, extract the array
                const hallsArray = hallsData?.halls || hallsData;
                console.log('🏛️ Halls array:', hallsArray);
                console.log('🏛️ Is array:', Array.isArray(hallsArray));
                
                if (hallsArray && Array.isArray(hallsArray) && hallsArray.length > 0) {
                    // Transform API format: { id: { id: "..." } } -> { id: "..." }
                    const transformedHalls = hallsArray.map((hall: any) => ({
                        id: hall.id?.id || hall.id,
                        name: hall.name,
                        seats: hall.seats || []
                    }));
                    console.log('✅ Transformed halls:', transformedHalls);
                    setHalls(transformedHalls);
                } else {
                    console.warn('⚠️ No halls returned from API, using MOCK_HALLS');
                }
            } catch (err) {
                console.error('❌ Failed to load halls:', err);
                // Keep MOCK_HALLS as fallback
            }
        };

        loadHalls();
    }, []);

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

        // If hall changed, load hall details with seats
        if (field === 'hall' && value) {
            loadHallDetails(value);
        }
    };

    const loadHallDetails = async (hallId: string) => {
        try {
            const hallData = await getHallById(hallId);
            console.log('🏛️ Loaded hall details:', hallData);
            
            // Update halls list with detailed hall info
            setHalls(prev => prev.map(h => 
                h.id === hallId ? { 
                    ...h, 
                    seats: hallData.seats || []
                } : h
            ));

            // Extract unique seat types from seats
            if (hallData.seats && Array.isArray(hallData.seats)) {
                const uniqueTypes = new Map();
                hallData.seats.forEach((seat: any) => {
                    const seatTypeId = seat.seatTypeId?.id || seat.seatTypeId;
                    const seatTypeName = seat.seatTypeName;
                    if (seatTypeId && !uniqueTypes.has(seatTypeId)) {
                        uniqueTypes.set(seatTypeId, {
                            id: seatTypeId,
                            name: seatTypeName || 'Unknown'
                        });
                    }
                });
                const extractedTypes = Array.from(uniqueTypes.values());
                console.log('🎫 Extracted seat types:', extractedTypes);
                setSeatTypes(extractedTypes);
            }
        } catch (err) {
            console.error('Failed to load hall details:', err);
        }
    };

    const handleAddStill = async () => {
        const trimmed = stillInput.trim();
        if (!trimmed) return;

        setSavingMedia(true);
        setError(null);

        try {
            const response = await createAndAttachMedia(movieId ?? '', {
                url: trimmed,
                type: MediaType.Image
            });

            // Add to local state
            const newStill: MediaItem = {
                id: response.movieId + '-' + Date.now(),
                url: trimmed,
                type: MediaType.Image
            };
            setStills(prev => [...prev, newStill]);
            setStillInput('');
            alert('Still added successfully!');
        } catch (err: any) {
            console.error('Failed to add still:', err);
            setError(err.response?.data?.detail || 'Failed to add still');
        } finally {
            setSavingMedia(false);
        }
    };

    const handleRemoveStill = async (mediaId: string) => {
        setSavingMedia(true);
        setError(null);

        try {
            await deleteMedia(movieId ?? '', mediaId);
            setStills(prev => prev.filter(m => m.id !== mediaId));
            alert('Still removed successfully!');
        } catch (err: any) {
            console.error('Failed to remove still:', err);
            setError(err.response?.data?.detail || 'Failed to remove still');
        } finally {
            setSavingMedia(false);
        }
    };

    const handleSaveTrailer = async () => {
        const trimmed = trailerInput.trim();
        if (!trimmed) return;

        setSavingMedia(true);
        setError(null);

        try {
            // If there's already a trailer, delete it first (only one trailer allowed)
            if (trailer && trailer.id) {
                console.log('Deleting existing trailer:', trailer.id);
                await deleteMedia(movieId ?? '', trailer.id);
            }

            // Add new trailer
            const response = await createAndAttachMedia(movieId ?? '', {
                url: trimmed,
                type: MediaType.Video
            });

            const newTrailer: MediaItem = {
                id: response.movieId + '-trailer',
                url: trimmed,
                type: MediaType.Video
            };
            setTrailer(newTrailer);
            alert('Trailer saved successfully!');
        } catch (err: any) {
            console.error('Failed to save trailer:', err);
            setError(err.response?.data?.detail || 'Failed to save trailer');
        } finally {
            setSavingMedia(false);
        }
    };

    const handleRemoveTrailer = async () => {
        if (!trailer) return;

        setSavingMedia(true);
        setError(null);

        try {
            await deleteMedia(movieId ?? '', trailer.id);
            setTrailer(null);
            setTrailerInput('');
            alert('Trailer removed successfully!');
        } catch (err: any) {
            console.error('Failed to remove trailer:', err);
            setError(err.response?.data?.detail || 'Failed to remove trailer');
        } finally {
            setSavingMedia(false);
        }
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
            console.log('💾 Saving movie details');
            console.log('📋 formData.duration:', formData.duration);
            console.log('📋 formData.duration type:', typeof formData.duration);
            console.log('📋 formData.duration empty?:', formData.duration === '' || !formData.duration);
            
            const durationSeconds = formData.duration ? calculateDurationSeconds(formData.duration) : 0;
            console.log('⏱️ Calculated durationSeconds:', durationSeconds);
            
            const detailsPayload = {
                name: formData.movieName,
                description: formData.description,
                rate: Number(formData.rate),
                ageLimit: Number(formData.ageLimit),
                durationSeconds: durationSeconds,
                country: formData.country,
                studio: formData.studio,
                language: formData.language,
                genres: formData.genres,
                directors: formData.directors,
                starring: formData.starring
            };
            
            console.log('📤 Sending payload:', detailsPayload);
            
            await updateMoviePartial(movieId || '', detailsPayload);

            // TODO: API calls for media/trailer when available
            // if (movieId) {
            //     await createAndAttachMedia(movieId, { url: trailerUrl, type: MediaType.Trailer });
            //     await Promise.all(mediaUrls.map(url => createAndAttachMedia(movieId, { url, type: MediaType.Still })));
            // }
            
            alert('Movie details saved successfully!');
            setError(null);
        } catch (err: any) {
            console.error('Failed to save movie details:', err);
            setError(err.response?.data?.detail || 'Failed to save movie details');
        } finally {
            setSaving(false);
            setDetailsOnly(false);
        }
    };

    const handleSaveSession = async (sessionId: string) => {
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        try {
            const prices = Object.keys(session.enabledTypes)
                .filter(typeId => session.enabledTypes[typeId] && session.seatPrices[typeId])
                .map(typeId => ({
                    seatTypeId: typeId,
                    price: Number(session.seatPrices[typeId] || 0)
                }));

            if (prices.length === 0) {
                setError('Please configure at least one seat type and price for the session');
                return;
            }

            // Check if this is a new session (temporary ID) or existing (UUID)
            const isNewSession = sessionId.length < 20; // Temporary IDs are short numbers
            
            if (isNewSession) {
                // Create new session - use CreateSessionCommand format
                const createPayload = {
                    movieId: safeMovieId,
                    hallId: session.hall,
                    format: 1, // MovieFormat.Standard = 1
                    startTime: `${session.date}T${session.time}:00Z`, // Add Z for UTC
                    prices: prices
                };
                console.log('Creating session with payload:', createPayload);
                await createSession(createPayload);
            } else {
                // Update existing session - use SessionUpdatePartialRequest format
                const updatePayload = {
                    movieID: { id: movieId },
                    hallId: { id: session.hall },
                    startDateTime: `${session.date}T${session.time}:00Z` // Add Z for UTC
                };
                console.log('Updating session with payload:', updatePayload);
                await updateSessionPartial(sessionId, updatePayload);
            }
            
            alert('Session saved successfully!');
            // Reload sessions to get updated data
            const sessionsData = await getMovieSessions(movieId ?? '');
            if (sessionsData && Array.isArray(sessionsData)) {
                const loadedSessions = sessionsData.map((s: any) => ({
                    id: s.id || s.sessionId,
                    date: s.startDateTime?.split('T')[0] || '',
                    time: s.startDateTime?.split('T')[1]?.substring(0, 5) || '',
                    hall: s.hallId?.id || s.hallId || '',
                    seatPrices: s.prices?.reduce((acc: any, p: any) => {
                        acc[p.seatTypeId] = String(p.price);
                        return acc;
                    }, {}) || {},
                    enabledTypes: s.prices?.reduce((acc: any, p: any) => {
                        acc[p.seatTypeId] = true;
                        return acc;
                    }, {}) || {}
                }));
                setSessions(loadedSessions);
            }
        } catch (err: any) {
            console.error('Failed to update session:', err);
            setError(err.response?.data?.detail || 'Failed to update session');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setDetailsOnly(false);
        setError(null);

        try {
            const updatePayload = {
                name: formData.movieName,
                description: formData.description,
                rate: Number(formData.rate),
                ageLimit: Number(formData.ageLimit),
                durationSecond: formData.duration ? calculateDurationSeconds(formData.duration) : 0,
                country: formData.country,
                studio: formData.studio,
                language: formData.language,
                genres: formData.genres,
                directors: formData.directors,
                starring: formData.starring
            };
            
            console.log('🚀 Updating movie with payload:', updatePayload);
            console.log('Movie ID:', movieId);
            
            await updateMovie(movieId || '', updatePayload);

            // TODO: API calls for media/trailer and sessions when available
            // if (movieId) {
            //     await createAndAttachMedia(movieId, { url: trailerUrl, type: MediaType.Trailer });
            //     await Promise.all(mediaUrls.map(url => createAndAttachMedia(movieId, { url, type: MediaType.Still })));
            // }
            
            navigate('/admin/movies');
        } catch (err: any) {
            console.error('Failed to update movie:', err);
            setError(err.response?.data?.detail || 'Failed to update movie');
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
                        <p>Manage stills and trailer for this movie. Changes are saved to the database immediately.</p>
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
                                    disabled={savingMedia || saving}
                                />
                                <button
                                    type="button"
                                    className="media-action-btn"
                                    onClick={handleSaveTrailer}
                                    disabled={savingMedia || saving || !trailerInput.trim()}
                                >
                                    {savingMedia ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                            {trailer ? (
                                <div className="media-preview">
                                    <span className="media-label">Current trailer:</span>
                                    <div className="media-preview-row">
                                        <a href={trailer.url} target="_blank" rel="noreferrer">
                                            {trailer.url}
                                        </a>
                                        <button
                                            type="button"
                                            className="media-remove-link"
                                            onClick={handleRemoveTrailer}
                                            disabled={savingMedia || saving}
                                        >
                                            {savingMedia ? 'Removing...' : 'Remove'}
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
                                    value={stillInput}
                                    onChange={(e) => setStillInput(e.target.value)}
                                    disabled={savingMedia || saving}
                                />
                                <button
                                    type="button"
                                    className="media-action-btn"
                                    onClick={handleAddStill}
                                    disabled={savingMedia || saving || !stillInput.trim()}
                                >
                                    {savingMedia ? 'Adding...' : 'Add'}
                                </button>
                            </div>

                            {stills.length > 0 ? (
                                <div className="media-preview-grid">
                                    {stills.map((media) => (
                                        <div key={media.id} className="media-preview-card">
                                            <img src={media.url} alt={`Still ${media.id}`} />
                                            <button
                                                type="button"
                                                className="media-remove-btn"
                                                onClick={() => handleRemoveStill(media.id)}
                                                disabled={savingMedia || saving}
                                                aria-label="Remove still"
                                            >
                                                {savingMedia ? '⏳' : '✕'}
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
                                                    seatTypes={AVAILABLE_SEAT_TYPES}
                                                />

                                                <TicketPriceManager
                                                    sessionId={session.id}
                                                    seatTypes={AVAILABLE_SEAT_TYPES}
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
