import { Children, ReactNode } from 'react'
import './AdminLayout.css'
import { AdminHeader } from '../../AdminHeader/AdminHeader';
import { AdminSidebar } from '../../AdminSidebar/AdminSidebar';
import { AdminSearch } from '../../AdminSearch/AdminSearch';
import { AdminFooter } from '../../AdminFooter/AdminFooter';

interface AdminLayoutProps {
    children: ReactNode;
};

export const AdminLayout = ({ children }: AdminLayoutProps) => {
    return (
        <div className='admin-layout'>
            <AdminHeader />
            <div className='admin-main-wrapper'>
                <div className='admin-main-wrapper-row'>
                    <AdminSidebar />
                    <main className='admin-content'>
                        <AdminSearch />
                        {children}
                    </main>
                </div>
            </div>
            <AdminFooter />
        </div>
    );
};