import React, { useState } from 'react';
import './GenreForm.css';

interface GenreFormProps {
    onSubmit: (genreName: string) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export const GenreForm: React.FC<GenreFormProps> = ({ onSubmit, onCancel, isLoading = false }) => {
    const [genreName, setGenreName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!genreName.trim()) {
            setError('Genre name is required');
            return;
        }

        try {
            await onSubmit(genreName.trim());
            setGenreName('');
        } catch (err: any) {
            setError(err.message || 'Failed to create genre');
        }
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Add New Genre</h3>
                    <button className="close-btn" onClick={onCancel}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="genre-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="genreName">Genre Name *</label>
                        <input
                            id="genreName"
                            type="text"
                            value={genreName}
                            onChange={(e) => setGenreName(e.target.value)}
                            placeholder="Enter genre name"
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isLoading || !genreName.trim()}
                        >
                            {isLoading ? 'Creating...' : 'Create Genre'}
                        </button>
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
