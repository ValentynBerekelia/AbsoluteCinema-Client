import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './ClientDetailPage.css';

interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    totalBookings: number;
}

export const ClientDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState<Client | null>(null);

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
            const foundClient = mockClients.find(c => c.id === parseInt(id || '0'));
            setClient(foundClient || null);
            setLoading(false);
        }, 500);
    }, [id]);

    if (loading) {
        return (
            <div className="client-detail-page">
                <div className="loading-state">Loading client...</div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="client-detail-page">
                <h2>Client not found</h2>
                <button onClick={() => navigate('/admin/clients')} className="back-btn">
                    Back to Clients
                </button>
            </div>
        );
    }

    return (
        <div className="client-detail-page">
            <div className="page-header">
                <h2>{client.name}</h2>
                <button onClick={() => navigate('/admin/clients')} className="back-btn">
                    Back to Clients
                </button>
            </div>

            <div className="client-info">
                <div className="info-section">
                    <h3>Contact Information</h3>
                    <div className="info-item">
                        <label>Name:</label>
                        <span>{client.name}</span>
                    </div>
                    <div className="info-item">
                        <label>Email:</label>
                        <span>{client.email}</span>
                    </div>
                    <div className="info-item">
                        <label>Phone:</label>
                        <span>{client.phone}</span>
                    </div>
                </div>

                <div className="info-section">
                    <h3>Booking Statistics</h3>
                    <div className="info-item">
                        <label>Total Bookings:</label>
                        <span className="stat-badge">{client.totalBookings}</span>
                    </div>
                </div>

                <div className="info-actions">
                    <button 
                        onClick={() => navigate(`/admin/clients/${client.id}/edit`)}
                        className="edit-btn"
                    >
                        Edit Client
                    </button>
                </div>
            </div>
        </div>
    );
};
