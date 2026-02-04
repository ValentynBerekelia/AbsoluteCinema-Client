import { useState } from 'react';
import { HashLink } from 'react-router-hash-link';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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

    return (
        <header className='header'>
            <div className='header-container'>
                <Link to="/" className='logo' onClick={closeMenu}>
                    AbsoluteCinema
                </Link>
                <nav className={`nav ${isMenuOpen ? 'active' : ''}`}>
                    <ul className='nav-list'>
                        <li><a href="#schedule">Schedule</a></li>
                        <li><HashLink smooth to="/#coming-soon">Coming Soon</HashLink></li>
                        <li><HashLink smooth to="/#promotion">Promotion</HashLink></li>
                        <li><HashLink smooth to="/#about-us">About us</HashLink></li>
                        <li className="mobile-only auth-buttons-mobile">
                            <button className="register-btn mobile" onClick={handleRegister}>Sign Up</button>
                            <button className="login-btn mobile" onClick={handleLogin}>Log in</button>
                        </li>
                    </ul>
                </nav>
                <div className='header-actions'>
                    <button className='register-btn' onClick={handleRegister}>Sign Up</button>
                    <button className='login-btn' onClick={handleLogin}>Log in</button>
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