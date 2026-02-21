import { useMemo } from 'react';
import { useGetSessionSummaries } from './useQueries';

interface FocusStatistics {
  focusStreak: number;
  totalFocusTime: number; // in minutes
  productiveVisitRatio: number; // 0-100
  weeklyTrend: Array<{ day: string; focusScore: number }>;
}

export function useFocusStatistics() {
  const { data: sessionSummaries = [], isLoading } = useGetSessionSummaries();

  // Calculate statistics
  const statistics = useMemo<FocusStatistics>(() => {
    // Calculate focus streak (consecutive days with completed sessions)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let checkDate = new Date(today);

    const sessionsByDay = new Map<string, boolean>();
    sessionSummaries.forEach((session) => {
      const date = new Date(Number(session.startTime) / 1000000);
      date.setHours(0, 0, 0, 0);
      sessionsByDay.set(date.toISOString(), true);
    });

    while (sessionsByDay.has(checkDate.toISOString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate total focus time
    const totalFocusTime = sessionSummaries.reduce((sum, session) => {
      return sum + Number(session.totalDuration) / (60 * 1000000000);
    }, 0);

    // Calculate productive visit ratio based on session data
    const totalDistractions = sessionSummaries.reduce((sum, session) => {
      return sum + Number(session.distractionsCount);
    }, 0);
    const totalSessions = sessionSummaries.length;
    const productiveVisitRatio = totalSessions > 0 
      ? Math.max(0, Math.round(100 - (totalDistractions / totalSessions) * 10))
      : 100;

    // Calculate weekly trend
    const weeklyTrend: Array<{ day: string; focusScore: number }> = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const daySessions = sessionSummaries.filter((session) => {
        const sessionDate = new Date(Number(session.startTime) / 1000000);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === date.getTime();
      });
      
      const avgScore = daySessions.length > 0
        ? daySessions.reduce((sum, session) => sum + Number(session.burnoutScore), 0) / daySessions.length
        : 0;

      weeklyTrend.push({
        day: days[date.getDay()],
        focusScore: Math.round(avgScore),
      });
    }

    return {
      focusStreak: streak,
      totalFocusTime: Math.round(totalFocusTime),
      productiveVisitRatio,
      weeklyTrend,
    };
  }, [sessionSummaries]);

  return statistics;
}
