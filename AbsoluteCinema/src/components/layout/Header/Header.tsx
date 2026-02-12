import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext/AuthContext';
import './Header.css';

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logoutUser } = useAuth();

    const isAdmin = user?.roles?.includes('Admin');

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const handleLogout = async () => {
        await logoutUser();
        closeMenu();
        navigate('/');
    };

    const renderMobileUserInfo = () => {
        if (!user) {
            return (
                <div className="auth-buttons-mobile">
                    <button className="register-btn" onClick={() => { navigate('/register'); closeMenu(); }}>Sign Up</button>
                    <button className="login-btn" onClick={() => { navigate('/login'); closeMenu(); }}>Log in</button>
                </div>
            );
        }
        return (
            <div className="auth-user-mobile">
                <span className="user-name-mobile">Hi, {user.userName}</span>
                <Link to="/profile" className="profile-link-mobile" onClick={closeMenu}>My Profile</Link>
                <button className="logout-btn-mobile" onClick={handleLogout}>Log out</button>
            </div>
        );
    };

    const renderDesktopAuth = () => {
        if (!user) {
            return (
                <div className="auth-actions">
                    <button className="login-btn" onClick={() => navigate('/login')}>Log in</button>
                    <button className="register-btn" onClick={() => navigate('/register')}>Sign Up</button>
                </div>
            );
        }

        return (
            <div className="auth-user-desktop">
                <span className="user-welcome">Welcome, <strong>{user.userName}</strong></span>
                <Link to="/profile" className="profile-btn">Profile</Link>
                <button className="logout-btn" onClick={handleLogout}>Log out</button>
            </div>
        );
    };

    return (
        <header className='header'>
            <div className='header-container'>
                <Link to="/" className='logo' onClick={closeMenu}>
                    <img src="/logo.png" alt="AbsoluteCinema" className='logo-image' />
                    <span className='logo-text'>AbsoluteCinema</span>
                </Link>

                <nav className={`nav ${isMenuOpen ? 'active' : ''}`}>
                    <ul className='nav-list'>
                        <li><Link to="/" onClick={closeMenu}>Schedule</Link></li>
                        <li><Link to="/movies" onClick={closeMenu}>Movie</Link></li>
                        <li><Link to="/about" onClick={closeMenu}>About Us</Link></li>

                        <li className="mobile-only-wrapper">
                            {renderMobileUserInfo()}
                        </li>
                    </ul>
                </nav>

                <div className='header-actions'>

                    {isAdmin && (
                        <Link to="/admin" className="promo-link admin-link" onClick={closeMenu}>
                            Admin Panel
                        </Link>
                    )}

                    <div className="desktop-only-wrapper">
                        <span className="header-divider">|</span>
                        {renderDesktopAuth()}
                    </div>

                    <button className={`burger-menu ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </div>
        </header>
    );
};