import React from 'react';
import { is_active } from '../Auth/authServices';
import { Navigate } from 'react-router';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = is_active();

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/signin" replace />;
    }

    return children;
};

export default PrivateRoute;