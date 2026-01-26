import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Footer.css'
import { faSquare } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faTelegram, faTwitter } from '@fortawesome/free-brands-svg-icons';

export const Footer = () => {
    return (
        <footer className='footer' id='about-us'>
            <div className='footer-container'>
                <div className='footer-column'>
                    <h3 className='footer-logo'>AbsoluteCinema</h3>
                    <p className='footer-info'>Limbo City, 4 Dreamers Blvd, 5th Floor, 010101</p>
                    <p className='footer-info'>Customer support hours: 10:00 AM to 8:00 PM</p>
                    <p className='footer-info'>© 2026 AbsoluteCinema. All rights reserved.</p>
                </div>
                <div className='footer-column'>
                    <h3>Contact Us</h3>
                    <p>Phone: <span>+380 00 000 00 00</span></p>
                    <p>Email: <span>absolute.cinema@gmail.com</span></p>
                </div>
                <div className='footer-column'>
                    <h3>Follow Us</h3>
                    <div className='social-icons'>
                        <FontAwesomeIcon icon={faInstagram} className='icon'/>
                        <FontAwesomeIcon icon={faFacebook} className='icon'/>
                        <FontAwesomeIcon icon={faTwitter} className='icon'/>
                        <FontAwesomeIcon icon={faTelegram} className='icon'/>
                    </div>
                </div>
            </div>
        </footer>
    );
};