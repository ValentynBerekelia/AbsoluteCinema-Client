import './AdminFooter.css'

export const AdminFooter = () => {
    return (
        <footer className='admin-footer'>
            <div className='admin-footer-content'>
                <div className='admin-footer-left'>
                    <p>AbsoluteCinema Admin Panel v1.0</p>
                    <p>@ 2026 AbsoluteCinema. All rights reserved.</p>
                </div>

                <div className='admin-footer-right'>
                    <h3>Tech Support</h3>
                    <div className='support-details'>
                        <p>Phone: <span>+380 XX XXX XX XX</span></p>
                        <p>Email: <span>support@absolute.cinema</span></p>
                    </div>
                </div>
            </div>
        </footer>
    );
};