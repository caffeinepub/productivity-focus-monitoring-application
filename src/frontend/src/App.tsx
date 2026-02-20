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
import Layout from './components/Layout';
import { BurnoutWarning } from './components/BurnoutWarning';
import { GreyscaleOverlay } from './components/GreyscaleOverlay';
import { BlockScreen } from './components/BlockScreen';
import { useBurnoutMonitor } from './hooks/useBurnoutMonitor';
import { useBlockingLogic } from './hooks/useBlockingLogic';

function RootComponent() {
  const { burnoutLevel, burnoutIndex, dismissWarning } = useBurnoutMonitor();
  const { isBlocked, blockTimeRemaining, completeProductiveSession } = useBlockingLogic();

  return (
    <>
      <Layout>
        <Outlet />
      </Layout>
      {burnoutLevel >= 1 && burnoutLevel < 2 && (
        <BurnoutWarning burnoutIndex={burnoutIndex} onDismiss={dismissWarning} />
      )}
      {burnoutLevel >= 2 && !isBlocked && <GreyscaleOverlay intensity={burnoutLevel} />}
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

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const liveMonitorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/monitor',
  component: LiveMonitor,
});

const appCategorizationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/apps',
  component: AppCategorization,
});

const deskRecoveryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/desk-recovery',
  component: DeskRecovery,
});

const walkBreakRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/walk-break',
  component: WalkBreak,
});

const achievementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/achievements',
  component: Achievements,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: Reports,
});

const routeTree = rootRoute.addChildren([
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
