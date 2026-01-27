import './AdminSidebar.css'

export const AdminSidebar = () => {
    return (
        <aside className='admin-sidebar'>
            <nav className='admin-nav'>
                <button className='admin-nav-btn'>Add movies</button>
                <button className='admin-nav-btn'>Halls</button>
                <button className='admin-nav-btn'>Clients</button>
                <button className='admin-nav-btn'>Current reservations</button>
            </nav>
        </aside>
    );
}