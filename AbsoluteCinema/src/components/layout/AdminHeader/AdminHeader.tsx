import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import './AdminHeader.css'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext/AuthContext';

export const AdminHeader = () => {
    const navigate = useNavigate();
    const { logoutUser } = useAuth();

    const handleLogOut = () => {
        logoutUser();
        navigate('/');
    };

    return (
        <header className='admin-header'>
            <a href="/" className='admin-logo-island'>
                <img src="/logo.png" alt="AbsoluteCinema" className='admin-logo-image' />
                <span className='admin-logo-text'>AbsoluteCinema</span>
            </a>

            <div className='admin-user-profile'>
                <span className='admin-name'>Admin</span>
                <button className='admin-logout-btn' title='Logout' onClick={handleLogOut}>
                    <FontAwesomeIcon icon={faArrowRightFromBracket} />
                </button>
            </div>
        </header>
    );
};