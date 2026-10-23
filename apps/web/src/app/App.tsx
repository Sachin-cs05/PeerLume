import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '../routes/index.js';
import { AuthProvider } from '../context/AuthContext.js';
import { SocketProvider } from '../context/SocketContext.js';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <RouterProvider router={router} />
      </SocketProvider>
    </AuthProvider>
  );
};

