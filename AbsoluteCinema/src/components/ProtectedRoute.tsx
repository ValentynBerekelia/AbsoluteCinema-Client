import { useAuth } from "@/context/AuthContext/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
    requiredRole?: string;
    requiredPermission?: string;
}

export const ProtectedRoute = ({ requiredRole, requiredPermission }: ProtectedRouteProps) => {
    const {user, loading} = useAuth();

    if (loading) return <div>Loading access rights...</div>

    if (!user) {
        return <Navigate to='/'replace/>;
    }

    if (requiredRole && !user.roles.includes(requiredRole)) {
        return <Navigate to='/'replace/>;
    }

    if (requiredPermission && !user.permissions.includes(requiredPermission)) {
        return <Navigate to='/'replace/>;
    }

    return <Outlet />;
}