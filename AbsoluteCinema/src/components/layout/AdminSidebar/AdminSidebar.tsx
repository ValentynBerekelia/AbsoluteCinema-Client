import { useNavigate } from 'react-router-dom';
import './AdminSideBar.css'

export const AdminSidebar = () => {
    const navigate = useNavigate();
    return (
        <aside className='admin-sidebar'>
            <nav className='admin-nav'>
                <button className='admin-nav-btn' onClick={() => navigate('/admin')}>Movies</button>
                <button className='admin-nav-btn' onClick={() => navigate('/admin/genres')}>Genres</button>
                <button className='admin-nav-btn' onClick={() => navigate('/admin/persons')}>Persons</button>
                <button className='admin-nav-btn' onClick={() => navigate('/admin/halls')}>Halls</button>
                <button className='admin-nav-btn'>Clients</button>
                <button className='admin-nav-btn' onClick={() => navigate('/admin/reservations')}>Current reservations</button>
            </nav>
        </aside>
    );
}