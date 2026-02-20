import { useState, useEffect } from 'react';
import { useFocusMonitor } from './useFocusMonitor';

/**
 * Blocking logic hook that manages progressive warning system
 * 
 * Flow:
 * 1. User dismisses burnout warning (warningCount++)
 * 2. After 2 dismissals, block screen activates
 * 3. User must complete 25-minute productive session
 * 4. During session, must maintain low switching frequency
 * 5. Timer only decrements when user is focused
 * 6. After completion, warning count resets
 */
export function useBlockingLogic() {
  const [warningCount, setWarningCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(25 * 60); // 25 minutes in seconds
  
  // Get real-time focus metrics to validate productive session
  const { switchesPerMinute, isAway } = useFocusMonitor();

  /**
   * Persist warning count to localStorage
   * Restore on mount to maintain state across sessions
   */
  useEffect(() => {
    const stored = localStorage.getItem('warningCount');
    if (stored) {
      setWarningCount(parseInt(stored, 10));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('warningCount', warningCount.toString());
  }, [warningCount]);

  /**
   * Activate block screen after second warning dismissal
   */
  useEffect(() => {
    if (warningCount >= 2) {
      setIsBlocked(true);
    }
  }, [warningCount]);

  /**
   * Countdown timer for productive session
   * 
   * Timer only decrements when:
   * - User is not away from the page
   * - Switching frequency is low (< 1 per minute)
   * 
   * This ensures the user is actually being productive, not just
   * keeping the tab open while doing other things
   */
  useEffect(() => {
    if (!isBlocked) return;

    const interval = setInterval(() => {
      // Only decrement timer if user is focused
      const isFocused = !isAway && switchesPerMinute < 1;
      
      if (isFocused) {
        setBlockTimeRemaining((prev) => {
          if (prev <= 1) {
            // Session complete!
            setIsBlocked(false);
            setWarningCount(0);
            return 25 * 60;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isBlocked, isAway, switchesPerMinute]);

  /**
   * Increment warning count (called when user dismisses burnout warning)
   */
  const incrementWarningCount = () => {
    setWarningCount((prev) => prev + 1);
  };

  /**
   * Complete productive session (called when timer reaches 0)
   */
  const completeProductiveSession = () => {
    setIsBlocked(false);
    setWarningCount(0);
    setBlockTimeRemaining(25 * 60);
  };

  return {
    warningCount,
    isBlocked,
    blockTimeRemaining,
    incrementWarningCount,
    completeProductiveSession,
  };
}
