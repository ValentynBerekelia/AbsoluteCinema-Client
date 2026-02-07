import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext/AuthContext'; // Імпортуємо наш хук
import './Header.css';

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    
    // Отримуємо дані про користувача та функцію виходу з контексту
    const { user, logoutUser } = useAuth();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = async () => {
        await logoutUser();
        setIsMenuOpen(false);
        navigate('/'); // Повертаємо на головну після виходу
    };

    const handleLogin = () => {
        navigate('/login');
        setIsMenuOpen(false);
    };

    const handleRegister = () => {
        navigate('/register');
        setIsMenuOpen(false);
    };

    const closeMenu = () => setIsMenuOpen(false);

    const renderAuthButtons = (isMobile: boolean) => {
        if (user) {
            return (
                <div className={isMobile ? "auth-user-mobile" : "auth-user-desktop"}>
                    <span className="user-name">Welcome, {user.userName || 'User'}</span>
                    <button 
                        className={isMobile ? "logout-btn mobile" : "logout-btn"} 
                        onClick={handleLogout}
                    >
                        Log out
                    </button>
                </div>
            );
        }

        return (
            <>
                <button 
                    className={isMobile ? "register-btn mobile" : "register-btn"} 
                    onClick={handleRegister}
                >
                    Sign Up
                </button>
                <button 
                    className={isMobile ? "login-btn mobile" : "login-btn"} 
                    onClick={handleLogin}
                >
                    Log in
                </button>
            </>
        );
    };

    return (
        <header className='header'>
            <div className='header-container'>
                <Link to="/" className='logo' onClick={closeMenu}>
                    AbsoluteCinema
                </Link>
                <nav className={`nav ${isMenuOpen ? 'active' : ''}`}>
                    <ul className='nav-list'>
                        <li><Link to="/" onClick={closeMenu}>Home</Link></li>
                        <li><Link to="/movies" onClick={closeMenu}>Movies</Link></li>
                        <li><Link to="/about" onClick={closeMenu}>About Us</Link></li>
                        <li className="mobile-only auth-buttons-mobile">
                            {renderAuthButtons(true)}
                        </li>
                    </ul>
                </nav>
                <div className='header-actions'>
                    <div className="desktop-only auth-actions">
                        {renderAuthButtons(false)}
                    </div>
                    
                    <button className={`burger-menu ${isMenuOpen ? 'open' : ''}`}
                        onClick={toggleMenu}
                        aria-label='Open menu'
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </header>
    );
};