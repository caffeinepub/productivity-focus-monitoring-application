import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Dashboard from './pages/Dashboard';
import LiveMonitor from './pages/LiveMonitor';
import AppCategorization from './pages/AppCategorization';
import DeskRecovery from './pages/DeskRecovery';
import WalkBreak from './pages/WalkBreak';
import Achievements from './pages/Achievements';
import Reports from './pages/Reports';
import FocusSession from './pages/FocusSession';
import SessionHistory from './pages/SessionHistory';
import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

// Public route - no authentication required
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

// Protected routes - require authentication
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <Dashboard />
      </Layout>
    </ProtectedRoute>
  ),
});

const liveMonitorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/monitor',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <LiveMonitor />
      </Layout>
    </ProtectedRoute>
  ),
});

const appCategorizationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/apps',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <AppCategorization />
      </Layout>
    </ProtectedRoute>
  ),
});

const focusSessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/focus-session',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <FocusSession />
      </Layout>
    </ProtectedRoute>
  ),
});

const sessionHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/session-history',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <SessionHistory />
      </Layout>
    </ProtectedRoute>
  ),
});

const deskRecoveryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/desk-recovery',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <DeskRecovery />
      </Layout>
    </ProtectedRoute>
  ),
});

const walkBreakRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/walk-break',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <WalkBreak />
      </Layout>
    </ProtectedRoute>
  ),
});

const achievementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/achievements',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <Achievements />
      </Layout>
    </ProtectedRoute>
  ),
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <Reports />
      </Layout>
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  indexRoute,
  liveMonitorRoute,
  appCategorizationRoute,
  focusSessionRoute,
  sessionHistoryRoute,
  deskRecoveryRoute,
  walkBreakRoute,
  achievementsRoute,
  reportsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
