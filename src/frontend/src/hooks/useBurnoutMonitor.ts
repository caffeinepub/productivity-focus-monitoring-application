import { useState, useEffect } from 'react';
import { useActivitySimulator } from './useActivitySimulator';
import { useApplications } from './useApplications';
import { useActor } from './useActor';

/**
 * Burnout monitoring hook that calculates burnout index using the mathematical formula:
 * 
 * BI_new = BI_old + (Δt × Weight_app) + (SwitchCount × σ)
 * 
 * Where:
 * - BI_old: Previous burnout index (0-100 scale)
 * - BI_new: Updated burnout index after calculation
 * - Δt: Time spent in the current application session (in seconds)
 * - Weight_app: Application distraction weight (0.1-0.3 for productive, 0.5-1.0 for distracting)
 * - SwitchCount: Number of application switches in the current period
 * - σ (sigma): Context switching penalty constant (mental cost of switching)
 * 
 * Burnout levels:
 * - Low: < 30 (healthy focus patterns)
 * - Medium: 30-60 (warning threshold, suggests break)
 * - High: > 60 (critical threshold, triggers grayscale overlay)
 */

// Context switching penalty constant (σ)
const SIGMA = 3;

// Default weight for unknown/uncategorized applications
const DEFAULT_WEIGHT = 0.4;

export function useBurnoutMonitor() {
  console.log('useBurnoutMonitor: Hook initializing');
  
  const [burnoutIndex, setBurnoutIndex] = useState(0);
  const [burnoutLevel, setBurnoutLevel] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [lastDismissedIndex, setLastDismissedIndex] = useState(0);
  
  // Track intermediate calculation components for breakdown display
  const [timeBasedContribution, setTimeBasedContribution] = useState(0);
  const [switchingContribution, setSwitchingContribution] = useState(0);
  
  // Track session timing for Δt calculation
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [lastApp, setLastApp] = useState<string>('');
  const [totalSwitchCount, setTotalSwitchCount] = useState(0);
  
  // Get current application activity data
  const activityData = useActivitySimulator();
  const applicationsData = useApplications();
  const actorData = useActor();
  
  // Defensive null checks
  const currentApp = activityData?.currentApp || '';
  const category = activityData?.category || 'productive';
  const switchCount = activityData?.switchCount || 0;
  const applications = applicationsData?.applications || [];
  const actor = actorData?.actor;

  /**
   * Get application weight (Weight_app) based on category
   */
  const getApplicationWeight = (appName: string): number => {
    try {
      const app = applications.find((a) => a.name === appName);
      
      if (!app) {
        return DEFAULT_WEIGHT;
      }
      
      if (app.category === 'productive') {
        return 0.2;
      } else {
        return 0.8;
      }
    } catch (error) {
      console.error('useBurnoutMonitor: Error getting application weight:', error);
      return DEFAULT_WEIGHT;
    }
  };

  /**
   * Calculate burnout index using the mathematical formula
   */
  useEffect(() => {
    try {
      // Detect application switch
      if (currentApp !== lastApp && lastApp !== '') {
        const now = Date.now();
        
        // Calculate Δt: Time spent in the previous application (in seconds)
        const deltaT = Math.max(0, (now - sessionStartTime) / 1000);
        
        // Get Weight_app for the previous application
        const weight = getApplicationWeight(lastApp);
        
        // Increment switch count
        const newSwitchCount = totalSwitchCount + 1;
        setTotalSwitchCount(newSwitchCount);
        
        // Calculate burnout contributions
        const timeBased = deltaT * weight;
        const switchingBased = newSwitchCount * SIGMA;
        
        // Apply the burnout formula
        setBurnoutIndex((prevIndex) => {
          const newIndex = prevIndex + timeBased + switchingBased;
          const scaledIndex = Math.min(Math.max(0, newIndex * 0.1), 100);
          return scaledIndex;
        });
        
        // Store contributions for breakdown display
        setTimeBasedContribution(timeBased);
        setSwitchingContribution(switchingBased);
        
        // Record calculation to backend
        if (actor) {
          actor.recordBurnoutCalculation({
            timestamp: BigInt(now * 1_000_000),
            previousIndex: BigInt(Math.floor(burnoutIndex)),
            currentIndex: BigInt(Math.floor(burnoutIndex + timeBased + switchingBased)),
            focusSessionTimestamps: [],
            switchCount: BigInt(newSwitchCount),
            breakAnalysis: {
              totalBreaks: BigInt(0),
              deskRecoveries: BigInt(0),
              walkBreaks: BigInt(0),
              restorativeRatio: 0,
            },
            sleepAnalysis: {
              totalSleepHours: 0,
              deepRestHours: 0,
              sleepDeficitScore: 0,
            },
            notificationAnalysis: {
              frequency: BigInt(0),
              responseTimeAverage: 0,
            },
          }).catch((error) => {
            console.error('useBurnoutMonitor: Failed to record burnout calculation:', error);
          });
        }
      }
      
      // Update tracking state for next switch
      if (currentApp !== lastApp) {
        setLastApp(currentApp);
        setSessionStartTime(Date.now());
      }
    } catch (error) {
      console.error('useBurnoutMonitor: Error in burnout calculation:', error);
    }
  }, [currentApp, lastApp, sessionStartTime, totalSwitchCount, applications, burnoutIndex, actor]);

  /**
   * Decrease burnout index during productive focus periods
   */
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const weight = getApplicationWeight(currentApp);
        
        if (weight < 0.3 && burnoutIndex > 0) {
          setBurnoutIndex((prev) => Math.max(prev - 0.5, 0));
        }
      } catch (error) {
        console.error('useBurnoutMonitor: Error in burnout recovery:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentApp, burnoutIndex, applications]);

  /**
   * Persist burnout index to localStorage
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('burnoutIndex');
      if (stored) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed)) {
          setBurnoutIndex(parsed);
        }
      }
    } catch (error) {
      console.error('useBurnoutMonitor: Error loading burnout index from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      if (!isNaN(burnoutIndex)) {
        localStorage.setItem('burnoutIndex', burnoutIndex.toString());
      }
    } catch (error) {
      console.error('useBurnoutMonitor: Error saving burnout index to localStorage:', error);
    }
  }, [burnoutIndex]);

  /**
   * Categorize burnout level based on index
   */
  useEffect(() => {
    try {
      if (burnoutIndex >= 60) {
        setBurnoutLevel(2);
      } else if (burnoutIndex >= 30) {
        setBurnoutLevel(1);
      } else {
        setBurnoutLevel(0);
        setIsDismissed(false);
      }
    } catch (error) {
      console.error('useBurnoutMonitor: Error updating burnout level:', error);
    }
  }, [burnoutIndex]);

  /**
   * Handle warning dismissal
   */
  const dismissWarning = () => {
    try {
      setIsDismissed(true);
      setLastDismissedIndex(burnoutIndex);
    } catch (error) {
      console.error('useBurnoutMonitor: Error dismissing warning:', error);
    }
  };

  // Show warning again if burnout increased significantly after dismissal
  useEffect(() => {
    try {
      if (isDismissed && burnoutIndex > lastDismissedIndex + 10) {
        setIsDismissed(false);
      }
    } catch (error) {
      console.error('useBurnoutMonitor: Error checking dismissal state:', error);
    }
  }, [burnoutIndex, isDismissed, lastDismissedIndex]);

  console.log('useBurnoutMonitor: Returning state -', { burnoutIndex, burnoutLevel });

  return {
    burnoutIndex,
    burnoutLevel,
    dismissWarning,
    timeBasedContribution,
    switchingContribution,
    breakdown: {
      timeBased: timeBasedContribution,
      switchingBased: switchingContribution,
    },
  };
}
