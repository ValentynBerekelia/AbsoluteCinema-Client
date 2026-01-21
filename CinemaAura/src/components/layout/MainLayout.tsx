import { ReactNode } from "react";
import { Header } from "./Header/Header";
import { Footer } from "./Footer/Footer";

interface LayoutProps {
    children: ReactNode;
}

export const MainLayout = ({children}: LayoutProps) => {
    return (
        <div className="layout-wrapper">
            <Header/>
            <main>{children}</main>
            <Footer/>
        </div>
    );
};