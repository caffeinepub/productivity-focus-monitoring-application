import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { BurnoutWarning } from './components/BurnoutWarning';
import { GreyscaleOverlay } from './components/GreyscaleOverlay';
import { BlockScreen } from './components/BlockScreen';
import { useBurnoutMonitor } from './hooks/useBurnoutMonitor';
import { useBlockingLogic } from './hooks/useBlockingLogic';
import Dashboard from './pages/Dashboard';
import LiveMonitor from './pages/LiveMonitor';
import AppCategorization from './pages/AppCategorization';
import DeskRecovery from './pages/DeskRecovery';
import WalkBreak from './pages/WalkBreak';
import Achievements from './pages/Achievements';
import Reports from './pages/Reports';
import Login from './pages/Login';

console.log('App.tsx: Module loaded, defining routes');

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/',
  component: Dashboard,
});

const liveMonitorRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/live-monitor',
  component: LiveMonitor,
});

const appCategorizationRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/app-categorization',
  component: AppCategorization,
});

const deskRecoveryRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/desk-recovery',
  component: DeskRecovery,
});

const walkBreakRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/walk-break',
  component: WalkBreak,
});

const achievementsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/achievements',
  component: Achievements,
});

const reportsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/reports',
  component: Reports,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    liveMonitorRoute,
    appCategorizationRoute,
    deskRecoveryRoute,
    walkBreakRoute,
    achievementsRoute,
    reportsRoute,
  ]),
]);

console.log('App.tsx: Route tree created');

let router: ReturnType<typeof createRouter>;

try {
  console.log('App.tsx: Creating router...');
  router = createRouter({ 
    routeTree,
    defaultPreload: 'intent',
  });
  console.log('App.tsx: Router created successfully');
} catch (error) {
  console.error('=== CRITICAL: Failed to create router ===');
  console.error('Error:', error);
  console.error('========================================');
  throw error;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function BurnoutMonitoring() {
  console.log('BurnoutMonitoring: Component rendering');
  
  // React Hooks MUST be called at the top level, not inside try-catch
  const burnoutMonitorResult = useBurnoutMonitor();
  const blockingLogicResult = useBlockingLogic();

  // Defensive null checks
  if (!burnoutMonitorResult || !blockingLogicResult) {
    console.error('BurnoutMonitoring: Hook returned null/undefined');
    return null;
  }

  const { 
    burnoutIndex = 0, 
    burnoutLevel = 0, 
    dismissWarning, 
    timeBasedContribution = 0, 
    switchingContribution = 0 
  } = burnoutMonitorResult;
  
  const { 
    isBlocked = false, 
    blockTimeRemaining = 0, 
    completeProductiveSession 
  } = blockingLogicResult;

  console.log('BurnoutMonitoring: State -', { 
    burnoutIndex, 
    burnoutLevel, 
    isBlocked,
    timeBasedContribution,
    switchingContribution
  });

  try {
    return (
      <>
        {/* Show warning at medium burnout level (30-60) */}
        {burnoutLevel === 1 && typeof burnoutIndex === 'number' && !isNaN(burnoutIndex) && (
          <BurnoutWarning 
            burnoutIndex={burnoutIndex} 
            timeBasedContribution={timeBasedContribution}
            switchingContribution={switchingContribution}
            onDismiss={dismissWarning} 
          />
        )}

        {/* Show greyscale overlay at high burnout level (60+) */}
        {burnoutLevel === 2 && typeof burnoutIndex === 'number' && !isNaN(burnoutIndex) && (
          <GreyscaleOverlay intensity={burnoutLevel} />
        )}

        {/* Show block screen when blocking is triggered */}
        {isBlocked && typeof blockTimeRemaining === 'number' && !isNaN(blockTimeRemaining) && (
          <BlockScreen 
            timeRemaining={blockTimeRemaining} 
            onComplete={completeProductiveSession} 
          />
        )}
      </>
    );
  } catch (error) {
    console.error('BurnoutMonitoring: Render error -', error);
    return null;
  }
}

function App() {
  console.log('App: Component rendering');
  
  try {
    return (
      <ErrorBoundary>
        {/* Visible test element to verify rendering */}
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            padding: '8px 12px', 
            background: '#22c55e', 
            color: 'white', 
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          App is running ✓
        </div>
        
        <RouterProvider router={router} />
        <BurnoutMonitoring />
        <Toaster />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('=== CRITICAL: App render error ===');
    console.error('Error:', error);
    console.error('==================================');
    
    // Fallback UI for render errors
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#fee'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#c00' }}>
            App Render Error
          </h1>
          <p style={{ color: '#666', marginBottom: '8px' }}>
            The application failed to render.
          </p>
          <p style={{ color: '#666', fontFamily: 'monospace', fontSize: '12px' }}>
            {error instanceof Error ? error.message : String(error)}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

export default App;
