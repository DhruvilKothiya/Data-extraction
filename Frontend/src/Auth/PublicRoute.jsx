import React from 'react';
import { is_active } from '../Auth/authServices';
import { Navigate } from 'react-router';

const PublicRoute = ({ children }) => {
    const isAuthenticated = is_active();

    // If user is authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PublicRoute;