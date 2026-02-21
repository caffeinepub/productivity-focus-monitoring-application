import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { useApplications } from './useApplications';
import { useFocusSessionTimer } from './useFocusSessionTimer';
import { useActor } from './useActor';
import { TabType } from '../backend';
import { toast } from 'sonner';

export interface Violation {
  timestamp: number;
  sourceTab: 'productive' | 'distractive';
  targetTab: 'productive' | 'distractive';
}

export interface GrayscaleState {
  isActive: boolean;
  remainingSeconds: number;
}

export interface FocusSessionViolationsState {
  violations: Violation[];
  violationCount: number;
  grayscale: GrayscaleState;
  isLocked: boolean;
  warningCycle: number;
}

const STORAGE_KEY = 'focus-session-violations';
const GRAYSCALE_DURATION = 120; // 2 minutes in seconds
const VIOLATION_THRESHOLD = 3;

// Define productive and distractive routes
const PRODUCTIVE_ROUTES = ['/', '/monitor', '/apps', '/focus-session'];
const DISTRACTIVE_ROUTES = ['/achievements', '/reports'];

export function useFocusSessionViolations() {
  const router = useRouterState();
  const { applications } = useApplications();
  const { isActive: isSessionActive, isCompleted, remainingTime } = useFocusSessionTimer();
  const { actor } = useActor();
  const previousPath = useRef<string>('');

  const [state, setState] = useState<FocusSessionViolationsState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      violations: [],
      violationCount: 0,
      grayscale: { isActive: false, remainingSeconds: 0 },
      isLocked: false,
      warningCycle: 1,
    };
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Determine if a route is productive or distractive
  const getRouteType = useCallback((path: string): 'productive' | 'distractive' | 'neutral' => {
    if (PRODUCTIVE_ROUTES.includes(path)) return 'productive';
    if (DISTRACTIVE_ROUTES.includes(path)) return 'distractive';
    return 'neutral';
  }, []);

  // Track route changes and detect violations
  useEffect(() => {
    if (!isSessionActive || isCompleted) {
      return;
    }

    const currentPath = router.location.pathname;
    
    if (previousPath.current && previousPath.current !== currentPath) {
      const sourceType = getRouteType(previousPath.current);
      const targetType = getRouteType(currentPath);

      // Only count productive-to-distractive switches as violations
      if (sourceType === 'productive' && targetType === 'distractive') {
        const newViolation: Violation = {
          timestamp: Date.now(),
          sourceTab: 'productive',
          targetTab: 'distractive',
        };

        setState((prev) => {
          const newCount = prev.violationCount + 1;
          const newViolations = [...prev.violations, newViolation];

          // Record to backend
          if (actor) {
            actor.recordTabSwitch(TabType.productive, TabType.distractive).catch((error) => {
              console.error('Failed to record tab switch:', error);
            });
          }

          // Check if we hit the threshold
          if (newCount >= VIOLATION_THRESHOLD && !prev.grayscale.isActive) {
            toast.warning(`Strike ${newCount}! Entering grayscale mode for 2 minutes.`, {
              description: 'Stay focused on productive tasks.',
            });

            return {
              ...prev,
              violations: newViolations,
              violationCount: newCount,
              grayscale: {
                isActive: true,
                remainingSeconds: GRAYSCALE_DURATION,
              },
            };
          }

          return {
            ...prev,
            violations: newViolations,
            violationCount: newCount,
          };
        });
      }
    }

    previousPath.current = currentPath;
  }, [router.location.pathname, isSessionActive, isCompleted, getRouteType, actor]);

  // Grayscale countdown timer
  useEffect(() => {
    if (!state.grayscale.isActive || state.grayscale.remainingSeconds <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setState((prev) => {
        const newRemaining = prev.grayscale.remainingSeconds - 1;

        if (newRemaining <= 0) {
          // Reset violation count and start new warning cycle
          toast.success('Warning cycle reset! You have 3 fresh warnings.', {
            description: `Starting warning cycle ${prev.warningCycle + 1}`,
          });

          return {
            ...prev,
            violationCount: 0,
            grayscale: {
              isActive: false,
              remainingSeconds: 0,
            },
            warningCycle: prev.warningCycle + 1,
          };
        }

        return {
          ...prev,
          grayscale: {
            ...prev.grayscale,
            remainingSeconds: newRemaining,
          },
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.grayscale.isActive, state.grayscale.remainingSeconds]);

  // Lock distractive sections after repeated violations
  useEffect(() => {
    if (isSessionActive && state.violationCount >= VIOLATION_THRESHOLD * 2) {
      setState((prev) => ({ ...prev, isLocked: true }));
    }
  }, [isSessionActive, state.violationCount]);

  // Clear all restrictions when session completes
  useEffect(() => {
    if (isCompleted) {
      setState({
        violations: [],
        violationCount: 0,
        grayscale: { isActive: false, remainingSeconds: 0 },
        isLocked: false,
        warningCycle: 1,
      });
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isCompleted]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const isCurrentRouteDistractive = useCallback(() => {
    return getRouteType(router.location.pathname) === 'distractive';
  }, [router.location.pathname, getRouteType]);

  return {
    ...state,
    isCurrentRouteDistractive: isCurrentRouteDistractive(),
    formatGrayscaleTime: formatTime(state.grayscale.remainingSeconds),
    sessionRemainingTime: remainingTime,
  };
}
