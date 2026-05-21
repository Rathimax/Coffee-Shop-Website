import React from 'react';
import { Navigate } from 'react-router-dom';

const ADMIN_EMAIL = 'abhayrajrathi616@gmail.com'; // Default admin email

const AdminRoute = ({ user, loading, children }) => {
  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)',
        color: 'var(--primary)',
        fontFamily: 'var(--font-serif)',
        fontSize: '1.2rem'
      }}>
        Verifying access...
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
