import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertTriangle, Clock, Target } from 'lucide-react';

interface FocusSessionSummaryProps {
  duration: number; // in seconds
  violationCount: number;
  warningCycles: number;
  focusScore: number;
}

export function FocusSessionSummary({
  duration,
  violationCount,
  warningCycles,
  focusScore,
}: FocusSessionSummaryProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Session Complete!
        </CardTitle>
        <CardDescription>Here's how you performed during your focus session</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Duration</span>
            </div>
            <p className="text-2xl font-bold">{formatDuration(duration)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>Focus Score</span>
            </div>
            <p className="text-2xl font-bold">{focusScore}%</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span>Violations</span>
            </div>
            <p className="text-2xl font-bold">{violationCount}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span>Warning Cycles</span>
            </div>
            <p className="text-2xl font-bold">{warningCycles}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Performance</span>
            <span className="font-semibold">{focusScore}%</span>
          </div>
          <Progress value={focusScore} className="h-2" />
        </div>

        <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
          <p className="text-sm text-center">
            {focusScore >= 80
              ? '🎉 Excellent focus! Keep up the great work!'
              : focusScore >= 60
              ? '👍 Good session! Try to minimize distractions next time.'
              : '💪 Room for improvement. Stay focused on productive tasks!'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
