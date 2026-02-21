import { useGetCurrentSessionStats, useGetSessionSummaries } from './useQueries';

export function useBurnoutScore() {
  const { data: currentStats, isLoading: currentLoading } = useGetCurrentSessionStats();
  const { data: summaries = [], isLoading: summariesLoading } = useGetSessionSummaries();

  // Get current burnout score from active session or most recent session
  const currentScore = currentStats 
    ? calculateBurnoutFromStats(currentStats)
    : summaries.length > 0 
      ? Number(summaries[summaries.length - 1].burnoutScore)
      : 0;

  // Categorize score level
  const scoreLevel: 'low' | 'medium' | 'high' = 
    currentScore < 30 ? 'low' :
    currentScore < 60 ? 'medium' :
    'high';

  return {
    currentScore,
    scoreLevel,
    isLoading: currentLoading || summariesLoading,
  };
}

function calculateBurnoutFromStats(stats: {
  productiveTime: bigint;
  distractingTime: bigint;
  startTime: bigint;
  distractionsCount: bigint;
  switchesCount: bigint;
}): number {
  const totalTime = Number(stats.productiveTime) + Number(stats.distractingTime);
  if (totalTime === 0) return 0;

  const focusRatio = (Number(stats.productiveTime) * 100) / totalTime;
  const switchPenalty = Number(stats.switchesCount) * 5;
  const distractionPenalty = Number(stats.distractionsCount) * 10;

  const score = Math.max(0, focusRatio - switchPenalty - distractionPenalty);
  return Math.round(score);
}
