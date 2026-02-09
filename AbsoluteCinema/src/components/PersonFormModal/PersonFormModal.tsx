import React, { useState } from 'react';
import './PersonFormModal.css';

export interface PersonFormData {
    fullName: string;
    bio: string;
    birthDate: string;
    role: number; // 1 = Director, 2 = Actor
    photoUrl?: string;
}

interface PersonFormModalProps {
    onSubmit: (personData: PersonFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export const PersonFormModal: React.FC<PersonFormModalProps> = ({ 
    onSubmit, 
    onCancel, 
    isLoading = false 
}) => {
    const [formData, setFormData] = useState<PersonFormData>({
        fullName: '',
        bio: '',
        birthDate: '',
        role: 2, // Default to Actor
        photoUrl: ''
    });
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'role' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.fullName.trim()) {
            setError('Full name is required');
            return;
        }

        if (!formData.birthDate) {
            setError('Birth date is required');
            return;
        }

        try {
            await onSubmit(formData);
            setFormData({
                fullName: '',
                bio: '',
                birthDate: '',
                role: 2,
                photoUrl: ''
            });
        } catch (err: any) {
            setError(err.message || 'Failed to create person');
        }
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Add New Person</h3>
                    <button className="close-btn" onClick={onCancel} type="button">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="person-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="fullName">Full Name *</label>
                        <input
                            id="fullName"
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter full name"
                            disabled={isLoading}
                            autoFocus
                            maxLength={200}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="birthDate">Birth Date *</label>
                        <input
                            id="birthDate"
                            type="date"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Role *</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        >
                            <option value={1}>Director</option>
                            <option value={2}>Actor</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="bio">Bio</label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Enter biography"
                            disabled={isLoading}
                            rows={4}
                            maxLength={1000}
                        />
                        <div className="char-count">
                            {formData.bio.length} / 1000
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="photoUrl">Photo URL</label>
                        <input
                            id="photoUrl"
                            type="url"
                            name="photoUrl"
                            value={formData.photoUrl || ''}
                            onChange={handleInputChange}
                            placeholder="https://..."
                            disabled={isLoading}
                            maxLength={1000}
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isLoading || !formData.fullName.trim() || !formData.birthDate}
                        >
                            {isLoading ? 'Creating...' : 'Create Person'}
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
