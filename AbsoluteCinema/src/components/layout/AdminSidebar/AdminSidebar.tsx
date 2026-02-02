import { useNavigate } from 'react-router-dom';
import './AdminSidebar.css'

export const AdminSidebar = () => {
    const navigate = useNavigate();
    return (
        <aside className='admin-sidebar'>
            <nav className='admin-nav'>
                <button className='admin-nav-btn' onClick={() => navigate('/admin/movies/add')}>Add movies</button>
                <button className='admin-nav-btn'>Halls</button>
                <button className='admin-nav-btn'>Clients</button>
                <button className='admin-nav-btn'>Current reservations</button>
            </nav>
        </aside>
    );
}