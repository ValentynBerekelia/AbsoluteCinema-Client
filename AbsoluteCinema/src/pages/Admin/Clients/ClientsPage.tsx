import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { clientService, Client } from '../../../api/clientService';
import './ClientsPage.css';

interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    totalBookings: number;
}

export const ClientsPage = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClients = async () => {
            // try {
            //     setLoading(true);
            //     setError(null);
            //     const data = await clientService.getClients();
            //     setClients(data);
            // } catch (err) {
            //     setError('Failed to load clients. Using mock data.');
            //     // Fallback to mock data
            //     setClients([
            //         { id: 1, name: "John Doe", email: "john.doe@email.com", phone: "+1234567890", totalBookings: 15 },
            //         { id: 2, name: "Jane Smith", email: "jane.smith@email.com", phone: "+1234567891", totalBookings: 8 },
            //         { id: 3, name: "Bob Johnson", email: "bob.j@email.com", phone: "+1234567892", totalBookings: 23 },
            //         { id: 4, name: "Alice Williams", email: "alice.w@email.com", phone: "+1234567893", totalBookings: 12 },
            //         { id: 5, name: "Charlie Brown", email: "charlie.b@email.com", phone: "+1234567894", totalBookings: 6 }
            //     ]);
            // } finally {
            //     setLoading(false);
            // }
            
            // Using mock data
            setLoading(true);
            setTimeout(() => {
                setClients([
                    { id: 1, name: "John Doe", email: "john.doe@email.com", phone: "+1234567890", totalBookings: 15 },
                    { id: 2, name: "Jane Smith", email: "jane.smith@email.com", phone: "+1234567891", totalBookings: 8 },
                    { id: 3, name: "Bob Johnson", email: "bob.j@email.com", phone: "+1234567892", totalBookings: 23 },
                    { id: 4, name: "Alice Williams", email: "alice.w@email.com", phone: "+1234567893", totalBookings: 12 },
                    { id: 5, name: "Charlie Brown", email: "charlie.b@email.com", phone: "+1234567894", totalBookings: 6 }
                ]);
                setLoading(false);
            }, 500);
        };

        fetchClients();
    }, []);

    const handleViewClient = (clientId: number) => {
        console.log('View client:', clientId);
        navigate(`/admin/clients/${clientId}`);
    };

    const handleEditClient = (clientId: number) => {
        console.log('Edit client:', clientId);
        navigate(`/admin/clients/${clientId}/edit`);
    };

    if (loading) {
        return (
            <div className="clients-page">
                <div className="loading-state">Loading clients...</div>
            </div>
        );
    }

    return (
        <div className="clients-page">
            <div className="clients-header">
                <h2>Clients</h2>
                <div className="clients-stats">
                    <span className="stat-item">Total: {clients.length}</span>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {clients.length === 0 ? (
                <div className="no-data">No clients available yet</div>
            ) : (
                <div className="clients-table-wrapper">
                <table className="clients-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Total Bookings</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(client => (
                            <tr key={client.id}>
                                <td>{client.id}</td>
                                <td>{client.name}</td>
                                <td>{client.email}</td>
                                <td>{client.phone}</td>
                                <td>
                                    <span className="bookings-badge">{client.totalBookings}</span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="view-btn" onClick={() => handleViewClient(client.id)}>View</button>
                                        <button className="edit-btn" onClick={() => handleEditClient(client.id)}>Edit</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}
        </div>
    );
};
