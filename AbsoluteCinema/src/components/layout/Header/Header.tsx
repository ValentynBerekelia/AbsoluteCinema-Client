import { useState } from 'react';
import {HashLink} from 'react-router-hash-link';
import './Header.css';
import { Link } from 'react-router-dom';

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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
                        <li><a href="#schedule" onClick={closeMenu}>Schedule</a></li>
                        <li><HashLink smooth to="/#coming-soon" onClick={closeMenu}>Coming Soon</HashLink></li>
                        <li><HashLink smooth to="/#promotion" onClick={closeMenu}>Promotion</HashLink></li>
                        <li><HashLink smooth to="/#about-us" onClick={closeMenu}>About us</HashLink></li>
                        <li className="mobile-only">
                            <button className="login-btn mobile">Log in</button>
                        </li>
                    </ul>
                </nav>
                <div className='header-actions'>
                    <button className='login-btn'>Log in</button>
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