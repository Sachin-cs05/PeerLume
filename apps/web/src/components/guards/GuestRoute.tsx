import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Spinner } from '../ui/Spinner.js';

export const GuestRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Spinner size="lg" label="Checking credentials..." />
      </div>
    );
  }

  if (user) {
    const redirectUrl = searchParams.get('redirect') || '/dashboard';
    return <Navigate to={redirectUrl} replace />;
  }

  return <>{children}</>;
};
