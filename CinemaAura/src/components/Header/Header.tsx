import './Header.css';

export const Header = () => {
    return (
        <header className='header'>
            <div className='header-container'>
                <div className='logo'>AbsoluteCinema</div>
                <nav className='nav'>
                    <ul className='nav-list'>
                        <li><a href="#schedule">Schedule</a></li>
                        <li><a href="#coming-soon">Coming Soon</a></li>
                        <li><a href="#promotion">Promotion</a></li>
                        <li><a href="#about-us">About us</a></li>
                    </ul>
                </nav>
                <div className='header-actions'>
                    <button className='login-btn'>Log in</button>
                    <button className='burger-menu' aria-label='Open menu'>
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </header>
    );
};