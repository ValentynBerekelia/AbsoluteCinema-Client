import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import './AdminHeader.css'
import { useNavigate } from 'react-router-dom';

export const AdminHeader = () => {
    const navigate = useNavigate();

    const handleLogOut = () => {
        console.log("Logging out...");

        navigate('/');
    };

    return (
        <header className='admin-header'>
            <div className='admin-na'></div>
            <div className='admin-header-logo'>
                AbsoluteCinema/<span>Movies</span>
            </div>

            <div className='admin-user-profile'>
                <span className='admin-name'>Admin</span>
                <button className='admin-logout-btn' title='Logout' onClick={handleLogOut}>
                    <FontAwesomeIcon icon={faArrowRightFromBracket}/>
                </button>
            </div>
        </header>
    );
};