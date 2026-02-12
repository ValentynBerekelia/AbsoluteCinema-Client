import { User } from '@/types/Auth';
import { useAuth } from '@/context/AuthContext/AuthContext';
import './UserInfoCard.css';

interface UserInfoCardProps {
    user: User;
    onRefresh: () => void;
}

export const UserInfoCard = ({ user, onRefresh }: UserInfoCardProps) => {
    const { revokeAllSessions, logoutUser } = useAuth();

    const handleRevokeAllSessions = async () => {
        if (window.confirm('Are you sure you want to terminate all other sessions?')) {
            await revokeAllSessions();
        }
    };

    return (
        <div className="user-info-card">
            <div className="user-header">
                <div className="user-avatar">
                    {user.userName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="user-details">
                    <h1 className="user-name">{user.userName}</h1>
                    <p className="user-email">{user.email}</p>
                    {user.roles && user.roles.length > 0 && (
                        <div className="user-roles">
                            {user.roles.map(role => (
                                <span key={role} className="role-badge">{role}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="user-actions">
                <button
                    className="action-button secondary"
                    onClick={handleRevokeAllSessions}
                    title="Terminate all other active sessions"
                >
                    Revoke All Sessions
                </button>
                <button
                    className="action-button danger"
                    onClick={logoutUser}
                >
                    Log Out
                </button>
            </div>
        </div>
    );
};
