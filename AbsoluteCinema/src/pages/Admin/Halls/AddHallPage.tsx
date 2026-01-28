import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './AddHallPage.css';

interface HallFormData {
    name: string;
    capacity: number;
    type: string;
}

export const AddHallPage = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<HallFormData>({
        name: '',
        capacity: 100,
        type: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'capacity' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => {
            console.log('Mock create hall:', formData);
            setSaving(false);
            navigate('/admin/halls');
        }, 500);
    };

    return (
        <div className="add-hall-page">
            <div className="page-header">
                <h2>Add New Hall</h2>
                <button onClick={() => navigate('/admin/halls')} className="back-btn">
                    Back to Halls
                </button>
            </div>

            <form onSubmit={handleSubmit} className="hall-form">
                <div className="form-section">
                    <div className="form-group">
                        <label htmlFor="name">Hall Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                            placeholder="Enter hall name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="type">Type *</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        >
                            <option value="">Select type</option>
                            <option value="Standard">Standard</option>
                            <option value="Premium">Premium</option>
                            <option value="IMAX">IMAX</option>
                            <option value="Classic">Classic</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="capacity">Capacity *</label>
                        <input
                            type="number"
                            id="capacity"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                            min="1"
                            max="500"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={saving}>
                        {saving ? 'Creating...' : 'Create Hall'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/halls')}
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
