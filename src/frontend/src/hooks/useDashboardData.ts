import { useState, useEffect } from 'react';

export function useDashboardData() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const focusTime = '4h 32m';
  const distractionTime = '1h 15m';
  const switchingFrequency = 12;
  const productivityScore = 78;

  const burnoutTrend = [
    { day: 'Mon', burnout: 3.2 },
    { day: 'Tue', burnout: 4.1 },
    { day: 'Wed', burnout: 3.8 },
    { day: 'Thu', burnout: 5.2 },
    { day: 'Fri', burnout: 4.5 },
    { day: 'Sat', burnout: 2.8 },
    { day: 'Sun', burnout: 3.1 },
  ];

  const recommendations = [
    'Your switching frequency is lower in the morning. Try scheduling deep work sessions before noon.',
    'You took 3 desk recovery breaks this week. Consider increasing to 5 for better cognitive restoration.',
    'Your longest focus session was 2.5 hours on Tuesday. Aim to replicate this pattern more often.',
    'Late-night work sessions show higher burnout indices. Consider ending work by 8 PM.',
  ];

  return {
    focusTime,
    distractionTime,
    switchingFrequency,
    burnoutTrend,
    productivityScore,
    recommendations,
    isLoading,
  };
}
