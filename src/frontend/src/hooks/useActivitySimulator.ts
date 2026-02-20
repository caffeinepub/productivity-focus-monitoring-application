import { useState, useEffect } from 'react';
import { useActor } from './useActor';
import { useApplications } from './useApplications';
import { AppCategory } from '../backend';

export function useActivitySimulator() {
  const { actor } = useActor();
  const { applications } = useApplications();
  const [currentApp, setCurrentApp] = useState('Visual Studio Code');
  const [category, setCategory] = useState<'productive' | 'distracting'>('productive');
  const [switchCount, setSwitchCount] = useState(0);
  const [switchesPerMinute, setSwitchesPerMinute] = useState(0);
  const [switchesPerHour, setSwitchesPerHour] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [lastSwitchTime, setLastSwitchTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && applications.length > 0) {
        const randomApp = applications[Math.floor(Math.random() * applications.length)];
        const previousApp = currentApp;

        setCurrentApp(randomApp.name);
        setCategory(randomApp.category);
        setSwitchCount((prev) => prev + 1);

        const now = Date.now();
        const timeSinceLastSwitch = (now - lastSwitchTime) / 1000;
        setLastSwitchTime(now);

        if (actor) {
          actor
            .recordSwitch({
              timestamp: BigInt(now * 1_000_000),
              sourceApp: previousApp,
              targetApp: randomApp.name,
            })
            .catch(console.error);
        }
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [actor, applications, currentApp, lastSwitchTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeWindow = 60000;
      setSwitchesPerMinute(switchCount / ((now - lastSwitchTime + timeWindow) / timeWindow));
      setSwitchesPerHour(switchCount * 7.5);
    }, 5000);

    return () => clearInterval(interval);
  }, [switchCount, lastSwitchTime]);

  return {
    currentApp,
    category,
    switchCount,
    switchesPerMinute,
    switchesPerHour,
    isActive,
  };
}
