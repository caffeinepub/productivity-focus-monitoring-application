import { useState, useEffect } from 'react';
import { useFocusMonitor } from './useFocusMonitor';

/**
 * Burnout monitoring hook that calculates burnout index based on real switching patterns
 * 
 * Burnout levels:
 * - Low: < 30 (healthy focus patterns)
 * - Medium: 30-60 (warning threshold, suggests break)
 * - High: > 60 (critical threshold, triggers grayscale overlay)
 */
export function useBurnoutMonitor() {
  const [burnoutIndex, setBurnoutIndex] = useState(0);
  const [burnoutLevel, setBurnoutLevel] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [lastDismissedIndex, setLastDismissedIndex] = useState(0);
  
  // Get real-time focus metrics
  const { switchesPerMinute, distractionScore } = useFocusMonitor();

  /**
   * Calculate burnout index based on switching patterns
   * 
   * Burnout increases when:
   * - Switches per minute exceeds 3 (frequent context switching)
   * - Distraction score increases (accumulated distraction)
   * 
   * Burnout decreases when:
   * - Switches per minute is low (< 1, focused work)
   * - Decreases by 1 every 5 minutes during focused periods
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setBurnoutIndex((prev) => {
        let newValue = prev;
        
        // Increase burnout if switching frequently
        if (switchesPerMinute > 3) {
          newValue = Math.min(prev + 2, 100);
        } else if (switchesPerMinute > 1) {
          newValue = Math.min(prev + 0.5, 100);
        }
        
        // Increase burnout based on distraction score
        if (distractionScore > 5) {
          newValue = Math.min(newValue + 1, 100);
        }
        
        // Decrease burnout during focused periods
        if (switchesPerMinute < 1 && prev > 0) {
          newValue = Math.max(prev - 1, 0);
        }
        
        return newValue;
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [switchesPerMinute, distractionScore]);

  /**
   * Persist burnout index to localStorage
   * Restore on mount to maintain state across sessions
   */
  useEffect(() => {
    const stored = localStorage.getItem('burnoutIndex');
    if (stored) {
      setBurnoutIndex(parseFloat(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('burnoutIndex', burnoutIndex.toString());
  }, [burnoutIndex]);

  /**
   * Categorize burnout level based on index
   * 
   * Level 0: < 30 (no warning)
   * Level 1: 30-60 (medium, show warning)
   * Level 2: > 60 (high, show grayscale overlay)
   */
  useEffect(() => {
    if (burnoutIndex >= 60) {
      setBurnoutLevel(2);
    } else if (burnoutIndex >= 30) {
      setBurnoutLevel(1);
    } else {
      setBurnoutLevel(0);
      setIsDismissed(false);
    }
  }, [burnoutIndex]);

  /**
   * Handle warning dismissal
   * Warning reappears if burnout increases by 10+ points after dismissal
   */
  const dismissWarning = () => {
    setIsDismissed(true);
    setLastDismissedIndex(burnoutIndex);
  };

  // Show warning again if burnout increased significantly after dismissal
  useEffect(() => {
    if (isDismissed && burnoutIndex > lastDismissedIndex + 10) {
      setIsDismissed(false);
    }
  }, [burnoutIndex, isDismissed, lastDismissedIndex]);

  return {
    burnoutIndex,
    burnoutLevel: isDismissed && burnoutLevel === 1 ? 0 : burnoutLevel,
    dismissWarning,
  };
}
