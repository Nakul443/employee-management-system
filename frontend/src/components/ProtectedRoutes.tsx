// this file is used to protect routes based on user authentication and roles

import { Navigate, useLocation } from 'react-router-dom';
import { JSX, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: JSX.Element;
    allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    // check user logged in or not
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // check for role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;