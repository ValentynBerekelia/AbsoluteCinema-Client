import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './EditClientPage.css';

interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    totalBookings: number;
}

interface ClientFormData {
    name: string;
    email: string;
    phone: string;
}

export const EditClientPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<ClientFormData>({
        name: '',
        email: '',
        phone: ''
    });

    const mockClients: Client[] = [
        { id: 1, name: "John Doe", email: "john.doe@email.com", phone: "+1234567890", totalBookings: 15 },
        { id: 2, name: "Jane Smith", email: "jane.smith@email.com", phone: "+1234567891", totalBookings: 8 },
        { id: 3, name: "Bob Johnson", email: "bob.j@email.com", phone: "+1234567892", totalBookings: 23 },
        { id: 4, name: "Alice Williams", email: "alice.w@email.com", phone: "+1234567893", totalBookings: 12 },
        { id: 5, name: "Charlie Brown", email: "charlie.b@email.com", phone: "+1234567894", totalBookings: 6 }
    ];

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const client = mockClients.find(c => c.id === parseInt(id || '0'));
            if (client) {
                setFormData({
                    name: client.name,
                    email: client.email,
                    phone: client.phone
                });
            }
            setLoading(false);
        }, 500);
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => {
            console.log('Mock save client:', formData);
            setSaving(false);
            navigate('/admin/clients');
        }, 500);
    };

    if (loading) {
        return (
            <div className="edit-client-page">
                <div className="loading-state">Loading client...</div>
            </div>
        );
    }

    return (
        <div className="edit-client-page">
            <div className="page-header">
                <h2>Edit Client</h2>
                <button onClick={() => navigate('/admin/clients')} className="back-btn">
                    Back to Clients
                </button>
            </div>

            <form onSubmit={handleSubmit} className="client-form">
                <div className="form-section">
                    <div className="form-group">
                        <label htmlFor="name">Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                            placeholder="Enter full name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                            placeholder="Enter email address"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone *</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                            placeholder="Enter phone number"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Client'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/clients')}
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
