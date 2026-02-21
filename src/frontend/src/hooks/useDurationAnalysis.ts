import { useGetDistractionLogs, useGetSessionSummaries } from './useQueries';

interface DurationDistribution {
  sustainedFocus: number;
  briefBrowsing: number;
  habitChecking: number;
}

interface HabitualDistraction {
  source: string;
  count: number;
  avgDuration: number;
}

export function useDurationAnalysis() {
  const { data: logs = [], isLoading: logsLoading } = useGetDistractionLogs();
  const { data: summaries = [], isLoading: summariesLoading } = useGetSessionSummaries();

  // Classify sessions by duration
  const distribution: DurationDistribution = {
    sustainedFocus: 0,
    briefBrowsing: 0,
    habitChecking: 0,
  };

  summaries.forEach((session) => {
    const durationMinutes = Number(session.totalDuration) / (60 * 1000000000);
    if (durationMinutes >= 25) {
      distribution.sustainedFocus++;
    } else if (durationMinutes >= 5) {
      distribution.briefBrowsing++;
    } else {
      distribution.habitChecking++;
    }
  });

  // Identify habitual distractions (repeated short visits)
  const distractionFrequency = new Map<string, number>();
  logs.forEach((log) => {
    const count = distractionFrequency.get(log.source) || 0;
    distractionFrequency.set(log.source, count + 1);
  });

  const habitualDistractions: HabitualDistraction[] = Array.from(distractionFrequency.entries())
    .filter(([_, count]) => count >= 3)
    .map(([source, count]) => ({
      source,
      count,
      avgDuration: 0, // Could be calculated if we track duration per distraction
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    durationDistribution: distribution,
    habitualDistractions,
    isLoading: logsLoading || summariesLoading,
  };
}
