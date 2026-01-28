import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { movieService, MovieUpdateDto } from '../../../api/movieService';
import { ADMIN_MOVIES_DATA } from '../../../data/adminMovies';
import './MovieEditPage.css';

interface MovieUpdateDto {
    title: string;
    duration: string;
    format: string;
    ageLimit: number;
    halls: string[];
    description: string;
}

export const MovieEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [formData, setFormData] = useState<MovieUpdateDto>({
        title: '',
        duration: '',
        format: '',
        ageLimit: 0,
        halls: [],
        description: ''
    });

    useEffect(() => {
        const fetchMovie = async () => {
            if (!id) return;
            
            // try {
            //     setLoading(true);
            //     setError(null);
            //     const movie = await movieService.getMovieById(id);
            //     setFormData({
            //         title: movie.title,
            //         duration: movie.duration,
            //         format: movie.format,
            //         ageLimit: movie.ageLimit,
            //         halls: movie.Halls,
            //         description: ''
            //     });
            // } catch (err) {
            //     setError('Failed to load movie. Using mock data.');
            //     // Fallback to mock data
            //     const movie = ADMIN_MOVIES_DATA.find(m => m.id === id);
            //     if (movie) {
            //         setFormData({
            //             title: movie.title,
            //             duration: movie.duration,
            //             format: movie.format,
            //             ageLimit: movie.ageLimit,
            //             halls: movie.Halls,
            //             description: ''
            //         });
            //     }
            // } finally {
            //     setLoading(false);
            // }
            
            // Using mock data
            setLoading(true);
            setTimeout(() => {
                const movie = ADMIN_MOVIES_DATA.find(m => m.id === id);
                if (movie) {
                    setFormData({
                        title: movie.title,
                        duration: movie.duration,
                        format: movie.format,
                        ageLimit: movie.ageLimit,
                        halls: movie.Halls,
                        description: ''
                    });
                }
                setLoading(false);
            }, 500);
        };

        fetchMovie();
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'ageLimit' ? parseInt(value) || 0 : value
        }));
    };

    const handleHallsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hallsArray = e.target.value.split(',').map(h => h.trim()).filter(h => h);
        setFormData(prev => ({
            ...prev,
            halls: hallsArray
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        // try {
        //     setSaving(true);
        //     setError(null);
        //     await movieService.updateMovie(id, formData);
        //     navigate('/admin/movies');
        // } catch (err) {
        //     setError('Failed to save movie. Please try again.');
        //     console.error('Save error:', err);
        // } finally {
        //     setSaving(false);
        // }
        
        // Using mock data
        setSaving(true);
        setTimeout(() => {
            console.log('Mock save:', formData);
            setSaving(false);
            navigate('/admin/movies');
        }, 500);
    };

    if (loading) {
        return (
            <div className="movie-edit-page">
                <div className="loading-state">Loading movie...</div>
            </div>
        );
    }

    if (!formData.title && !loading) {
        return (
            <div className="movie-edit-page">
                <h2>Movie not found</h2>
                <button onClick={() => navigate('/admin/movies')} className="back-btn">
                    Back to Movies
                </button>
            </div>
        );
    }

    return (
        <div className="movie-edit-page">
            <div className="edit-header">
                <h2>Edit Movie: {formData.title}</h2>
                <button onClick={() => navigate('/admin/movies')} className="back-btn">
                    Back to Movies
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="movie-edit-form">
                <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input 
                        type="text" 
                        id="title" 
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="form-input"
                        required
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
                        rows={4}
                        placeholder="Add movie description..."
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="duration">Duration *</label>
                        <input 
                            type="text" 
                            id="duration" 
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="HH:MM:SS"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="format">Format *</label>
                        <input 
                            type="text" 
                            id="format" 
                            name="format"
                            value={formData.format}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="2D, 3D, IMAX, etc."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="ageLimit">Age Limit *</label>
                        <input 
                            type="number" 
                            id="ageLimit" 
                            name="ageLimit"
                            value={formData.ageLimit}
                            onChange={handleInputChange}
                            className="form-input"
                            min="0"
                            max="21"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="halls">Halls (comma separated) *</label>
                    <input 
                        type="text" 
                        id="halls" 
                        name="halls"
                        value={formData.halls.join(', ')}
                        onChange={handleHallsChange}
                        className="form-input"
                        placeholder="Grand Hall, Blue Room, etc."
                        required
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="save-btn" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
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
