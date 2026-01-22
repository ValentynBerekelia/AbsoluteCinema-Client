import { Children, ReactNode } from 'react'
import './AdminLayout.css'
import { AdminHeader } from '../../AdminHeader/AdminHeader';
import { AdminSidebar } from '../../AdminSidebar/AdminSidebar';
import { AdminSearch } from '../../AdminSearch/AdminSearch';

interface AdminLayoutProps {
    children: ReactNode;
};

export const AdminLayout = ({ children }: AdminLayoutProps) => {
    return (
        <div className='admin-layout'>
            <AdminHeader />
            <div className='admin-main-wrapper'>
                <AdminSearch />
                <div className='admin-main-wrapper-row'>
                    <AdminSidebar />
                    <main className='admin-content'>
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};