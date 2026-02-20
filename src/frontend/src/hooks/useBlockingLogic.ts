import { useState, useEffect } from 'react';
import { useBurnoutMonitor } from './useBurnoutMonitor';
import { useFocusMonitor } from './useFocusMonitor';

const BLOCK_THRESHOLD = 80; // Burnout index threshold to trigger blocking
const PRODUCTIVE_SESSION_DURATION = 25 * 60; // 25 minutes in seconds
const DISMISS_LIMIT = 3; // Maximum number of dismissals before blocking

export function useBlockingLogic() {
  console.log('useBlockingLogic: Hook initializing');
  
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(PRODUCTIVE_SESSION_DURATION);
  const [dismissCount, setDismissCount] = useState(0);
  const [blockStartTime, setBlockStartTime] = useState<number | null>(null);
  
  const burnoutData = useBurnoutMonitor();
  const focusData = useFocusMonitor();
  
  // Defensive null checks
  const burnoutIndex = burnoutData?.burnoutIndex || 0;
  const switchesPerMinute = focusData?.switchesPerMinute;

  /**
   * Persist dismiss count to localStorage
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dismissCount');
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed)) {
          setDismissCount(parsed);
        }
      }
    } catch (error) {
      console.error('useBlockingLogic: Error loading dismiss count from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      if (!isNaN(dismissCount)) {
        localStorage.setItem('dismissCount', dismissCount.toString());
      }
    } catch (error) {
      console.error('useBlockingLogic: Error saving dismiss count to localStorage:', error);
    }
  }, [dismissCount]);

  /**
   * Check if blocking should be triggered
   */
  useEffect(() => {
    try {
      // Trigger blocking if:
      // 1. Burnout index exceeds threshold (80+)
      // 2. User has dismissed warnings too many times (3+)
      // 3. Excessive tab switching (10+ switches per minute)
      const shouldBlock =
        burnoutIndex >= BLOCK_THRESHOLD ||
        dismissCount >= DISMISS_LIMIT ||
        (typeof switchesPerMinute === 'number' && !isNaN(switchesPerMinute) && switchesPerMinute >= 10);

      if (shouldBlock && !isBlocked) {
        console.log('useBlockingLogic: Triggering block screen');
        setIsBlocked(true);
        setBlockStartTime(Date.now());
        setBlockTimeRemaining(PRODUCTIVE_SESSION_DURATION);
      }
    } catch (error) {
      console.error('useBlockingLogic: Error checking block conditions:', error);
    }
  }, [burnoutIndex, dismissCount, switchesPerMinute, isBlocked]);

  /**
   * Timer countdown for productive session
   */
  useEffect(() => {
    if (!isBlocked || blockStartTime === null) return;

    const interval = setInterval(() => {
      try {
        const elapsed = Math.floor((Date.now() - blockStartTime) / 1000);
        const remaining = Math.max(0, PRODUCTIVE_SESSION_DURATION - elapsed);
        
        setBlockTimeRemaining(remaining);

        // Unblock when timer completes
        if (remaining === 0) {
          console.log('useBlockingLogic: Productive session completed, unblocking');
          setIsBlocked(false);
          setBlockStartTime(null);
          setDismissCount(0); // Reset dismiss count after completing session
        }
      } catch (error) {
        console.error('useBlockingLogic: Error in timer countdown:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isBlocked, blockStartTime]);

  /**
   * Complete productive session manually
   */
  const completeProductiveSession = () => {
    try {
      console.log('useBlockingLogic: Manually completing productive session');
      setIsBlocked(false);
      setBlockStartTime(null);
      setBlockTimeRemaining(PRODUCTIVE_SESSION_DURATION);
      setDismissCount(0);
    } catch (error) {
      console.error('useBlockingLogic: Error completing productive session:', error);
    }
  };

  console.log('useBlockingLogic: Returning state -', { isBlocked, blockTimeRemaining });

  return {
    isBlocked,
    blockTimeRemaining,
    completeProductiveSession,
  };
}
