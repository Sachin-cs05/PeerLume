import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '../routes/index.js';
import { AuthProvider } from '../context/AuthContext.js';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};
