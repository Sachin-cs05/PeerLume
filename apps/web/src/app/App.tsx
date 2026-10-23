import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '../routes/index.js';
import { AuthProvider } from '../context/AuthContext.js';
import { SocketProvider } from '../context/SocketContext.js';
import { ThemeProvider } from '../context/ThemeContext.js';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <RouterProvider router={router} />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

