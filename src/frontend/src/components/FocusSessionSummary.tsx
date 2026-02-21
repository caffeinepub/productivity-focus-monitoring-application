import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface FocusSessionSummaryProps {
  duration: number;
  distractionsCount: number;
}

export function FocusSessionSummary({ duration, distractionsCount }: FocusSessionSummaryProps) {
  const durationMinutes = Math.floor(duration / 60);
  const focusScore = Math.max(0, 100 - distractionsCount * 10);

  const getPerformanceFeedback = () => {
    if (focusScore >= 90) return { text: 'Excellent focus!', color: 'text-green-600', icon: CheckCircle2 };
    if (focusScore >= 70) return { text: 'Good session!', color: 'text-blue-600', icon: CheckCircle2 };
    if (focusScore >= 50) return { text: 'Room for improvement', color: 'text-yellow-600', icon: AlertCircle };
    return { text: 'Keep practicing', color: 'text-orange-600', icon: AlertCircle };
  };

  const feedback = getPerformanceFeedback();
  const Icon = feedback.icon;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Duration</span>
              <span className="text-lg font-bold">{durationMinutes} minutes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Distractions</span>
              <span className="text-lg font-bold">{distractionsCount}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Focus Score</span>
                <span className="text-2xl font-bold">{focusScore}</span>
              </div>
              <Progress value={focusScore} className="h-2" />
            </div>
            <div className={`flex items-center gap-2 ${feedback.color}`}>
              <Icon className="h-5 w-5" />
              <span className="font-semibold">{feedback.text}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
