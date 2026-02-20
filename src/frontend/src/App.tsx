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
import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { BurnoutWarning } from './components/BurnoutWarning';
import { GreyscaleOverlay } from './components/GreyscaleOverlay';
import { BlockScreen } from './components/BlockScreen';
import { useBurnoutMonitor } from './hooks/useBurnoutMonitor';
import { useBlockingLogic } from './hooks/useBlockingLogic';

function RootComponent() {
  const { burnoutLevel, burnoutIndex, dismissWarning } = useBurnoutMonitor();
  const { isBlocked, blockTimeRemaining, completeProductiveSession, incrementWarningCount } = useBlockingLogic();

  /**
   * Handle burnout warning dismissal
   * Increments warning count for blocking logic
   */
  const handleDismissWarning = () => {
    dismissWarning();
    incrementWarningCount();
  };

  /**
   * Calculate grayscale intensity for overlay
   * Maps burnout index to grayscale percentage
   */
  const grayscaleIntensity = burnoutIndex > 60 ? (burnoutIndex - 60) / 40 : 0;

  return (
    <>
      <Outlet />
      
      {/* Show burnout warning at medium threshold (30-60) */}
      {burnoutLevel === 1 && (
        <BurnoutWarning burnoutIndex={burnoutIndex} onDismiss={handleDismissWarning} />
      )}
      
      {/* Show grayscale overlay at high threshold (60+) */}
      {burnoutIndex > 60 && !isBlocked && <GreyscaleOverlay intensity={grayscaleIntensity} />}
      
      {/* Show block screen after 2 warning dismissals */}
      {isBlocked && (
        <BlockScreen
          timeRemaining={blockTimeRemaining}
          onComplete={completeProductiveSession}
        />
      )}
      
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
