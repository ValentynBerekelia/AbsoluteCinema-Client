import React, { useState } from 'react';
import './PersonForm.css';

export enum PersonRole {
    Director = 1,
    Actor = 2
}

interface PersonFormProps {
    role: PersonRole;
    onSubmit: (data: { fullName: string; bio: string; birthDate: string; role: PersonRole }) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export const PersonForm: React.FC<PersonFormProps> = ({ role, onSubmit, onCancel, isLoading = false }) => {
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [error, setError] = useState<string | null>(null);

    const roleName = role === PersonRole.Director ? 'Director' : 'Actor';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!fullName.trim()) {
            setError('Full name is required');
            return;
        }

        if (!birthDate) {
            setError('Birth date is required');
            return;
        }

        try {
            await onSubmit({
                fullName: fullName.trim(),
                bio: bio.trim(),
                birthDate: new Date(birthDate).toISOString(),
                role
            });
            setFullName('');
            setBio('');
            setBirthDate('');
        } catch (err: any) {
            setError(err.message || `Failed to create ${roleName}`);
        }
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Add New {roleName}</h3>
                    <button className="close-btn" onClick={onCancel}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="person-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="fullName">Full Name *</label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter full name"
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="birthDate">Birth Date *</label>
                        <input
                            id="birthDate"
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="bio">Biography</label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Enter biography (optional)"
                            rows={4}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isLoading || !fullName.trim() || !birthDate}
                        >
                            {isLoading ? 'Creating...' : `Create ${roleName}`}
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
