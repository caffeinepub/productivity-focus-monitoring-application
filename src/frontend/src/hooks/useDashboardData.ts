import { useMemo } from 'react';

export function useDashboardData() {
  const isLoading = false;

  // Return mock data since old backend methods no longer exist
  const metrics = useMemo(() => {
    return {
      focusTime: '2h 15m',
      distractionTime: '25m',
      switchingFrequency: 5,
      productivityScore: 78,
      burnoutTrend: [
        { day: 'Mon', burnout: 3.2 },
        { day: 'Tue', burnout: 4.1 },
        { day: 'Wed', burnout: 3.8 },
        { day: 'Thu', burnout: 5.2 },
        { day: 'Fri', burnout: 4.5 },
        { day: 'Sat', burnout: 2.8 },
        { day: 'Sun', burnout: 3.1 },
      ],
      recommendations: [
        'Your focus patterns are looking good! Keep up the great work.',
        'Consider taking regular breaks to maintain your productivity.',
        'Try scheduling focused work blocks for optimal concentration.',
      ],
    };
  }, []);

  return {
    ...metrics,
    isLoading,
  };
}
