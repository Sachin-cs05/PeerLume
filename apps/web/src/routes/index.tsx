import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout.js';
import { LandingPage } from '../pages/LandingPage.js';
import { NotFoundPage } from '../pages/NotFoundPage.js';
import { LoginPage } from '../pages/auth/LoginPage.js';
import { RegisterPage } from '../pages/auth/RegisterPage.js';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage.js';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage.js';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage.js';
import { DashboardPage } from '../pages/dashboard/DashboardPage.js';
import { ProfileViewPage } from '../pages/profile/ProfileViewPage.js';
import { ProfileEditPage } from '../pages/profile/ProfileEditPage.js';
import { DiscoverPage } from '../pages/discovery/DiscoverPage.js';
import { ConnectionsPage } from '../pages/connections/ConnectionsPage.js';
import { ChatPage } from '../pages/ChatPage.js';
import { SessionsPage } from '../pages/sessions/SessionsPage.js';
import { SessionDetailPage } from '../pages/sessions/SessionDetailPage.js';
import { WorkspacePage } from '../pages/workspace/WorkspacePage.js';
import { ProtectedRoute } from '../components/guards/ProtectedRoute.js';
import { GuestRoute } from '../components/guards/GuestRoute.js';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      // Guest-only routes
      {
        path: 'login',
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <GuestRoute>
            <ResetPasswordPage />
          </GuestRoute>
        ),
      },
      // Verification route (accessible to both guest and authenticated users)
      {
        path: 'verify-email',
        element: <VerifyEmailPage />,
      },
      // Protected Student routes
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'discover',
        element: (
          <ProtectedRoute>
            <DiscoverPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'connections',
        element: (
          <ProtectedRoute>
            <ConnectionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'chat',
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'sessions',
        element: (
          <ProtectedRoute>
            <SessionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'sessions/:sessionId',
        element: (
          <ProtectedRoute>
            <SessionDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'workspace',
        element: (
          <ProtectedRoute>
            <WorkspacePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfileViewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile/edit',
        element: (
          <ProtectedRoute>
            <ProfileEditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },

    ],
  },
]);
