import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout.js';
import { LandingPage } from '../pages/LandingPage.js';
import { NotFoundPage } from '../pages/NotFoundPage.js';
import { LoginPage } from '../pages/auth/LoginPage.js';
import { RegisterPage } from '../pages/auth/RegisterPage.js';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage.js';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage.js';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage.js';
import { ProtectedRoute } from '../components/guards/ProtectedRoute.js';
import { GuestRoute } from '../components/guards/GuestRoute.js';
import { Spinner } from '../components/ui/Spinner.js';

// Lazy-load heavier student workflow pages
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage.js').then((m) => ({ default: m.DashboardPage })));
const ProfileViewPage = lazy(() => import('../pages/profile/ProfileViewPage.js').then((m) => ({ default: m.ProfileViewPage })));
const ProfileEditPage = lazy(() => import('../pages/profile/ProfileEditPage.js').then((m) => ({ default: m.ProfileEditPage })));
const DiscoverPage = lazy(() => import('../pages/discovery/DiscoverPage.js').then((m) => ({ default: m.DiscoverPage })));
const ConnectionsPage = lazy(() => import('../pages/connections/ConnectionsPage.js').then((m) => ({ default: m.ConnectionsPage })));
const ChatPage = lazy(() => import('../pages/ChatPage.js').then((m) => ({ default: m.ChatPage })));
const SessionsPage = lazy(() => import('../pages/sessions/SessionsPage.js').then((m) => ({ default: m.SessionsPage })));
const SessionDetailPage = lazy(() => import('../pages/sessions/SessionDetailPage.js').then((m) => ({ default: m.SessionDetailPage })));
const WorkspacePage = lazy(() => import('../pages/workspace/WorkspacePage.js').then((m) => ({ default: m.WorkspacePage })));
const CodeWorkspacesPage = lazy(() => import('../pages/code/CodeWorkspacesPage.js').then((m) => ({ default: m.CodeWorkspacesPage })));
const CodeEditorPage = lazy(() => import('../pages/code/CodeEditorPage.js').then((m) => ({ default: m.CodeEditorPage })));
const StudyRoomsPage = lazy(() => import('../pages/study-rooms/StudyRoomsPage.js').then((m) => ({ default: m.StudyRoomsPage })));
const StudyRoomPage = lazy(() => import('../pages/study-rooms/StudyRoomPage.js').then((m) => ({ default: m.StudyRoomPage })));

const PageSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center min-h-[60vh] py-16" aria-busy="true" aria-label="Loading page content">
        <Spinner size="lg" label="Loading..." />
      </div>
    }
  >
    {children}
  </Suspense>
);

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
      // Protected Student routes (lazy-loaded with PageSuspense)
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <PageSuspense>
              <DashboardPage />
            </PageSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'discover',
        element: (
          <ProtectedRoute>
            <PageSuspense>
              <DiscoverPage />
            </PageSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'connections',
        element: (
          <ProtectedRoute>
            <PageSuspense>
              <ConnectionsPage />
            </PageSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'chat',
        element: (
          <ProtectedRoute>
            <PageSuspense>
              <ChatPage />
            </PageSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'sessions',
        element: (
          <ProtectedRoute>
            <PageSuspense>
              <SessionsPage />
            </PageSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'sessions/:sessionId',
        element: (
          <ProtectedRoute>
            <PageSuspense>
              <SessionDetailPage />
            </PageSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'workspace',
        element: (
          <ProtectedRoute>
            <PageSuspense>
              <WorkspacePage />
            </PageSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'code',
        element: (
          <ProtectedRoute>
            <PageSuspense>
              <CodeWorkspacesPage />
            </PageSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'code/:workspaceId',
        element: (
          <ProtectedRoute>
            <PageSuspense>
              <CodeEditorPage />
            </PageSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'study-rooms',
        element: (
          <ProtectedRoute>
            <PageSuspense>
              <StudyRoomsPage />
            </PageSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'study-rooms/:roomId',
        element: (
          <ProtectedRoute>
            <PageSuspense>
              <StudyRoomPage />
            </PageSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <PageSuspense>
              <ProfileViewPage />
            </PageSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile/edit',
        element: (
          <ProtectedRoute>
            <PageSuspense>
              <ProfileEditPage />
            </PageSuspense>
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
