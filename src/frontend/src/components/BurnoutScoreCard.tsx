import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface BurnoutScoreCardProps {
  score: number;
  level: 'low' | 'medium' | 'high';
  isLoading?: boolean;
}

export function BurnoutScoreCard({ score, level, isLoading }: BurnoutScoreCardProps) {
  const getLevelConfig = () => {
    switch (level) {
      case 'low':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          icon: CheckCircle,
          label: 'Low Fatigue',
          description: 'You\'re maintaining good focus with minimal context switching',
        };
      case 'medium':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          icon: Activity,
          label: 'Moderate Fatigue',
          description: 'Consider taking a break to refresh your focus',
        };
      case 'high':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          icon: AlertTriangle,
          label: 'High Fatigue',
          description: 'Take a break! Frequent switching is impacting your productivity',
        };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Burnout Score</CardTitle>
          <CardDescription>Current cognitive load and fatigue level</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const config = getLevelConfig();
  const Icon = config.icon;

  return (
    <Card className={`${config.borderColor} border-2 ${config.bgColor}`}>
      <CardHeader>
        <CardTitle>Burnout Score</CardTitle>
        <CardDescription>Current cognitive load and fatigue level</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className={`h-8 w-8 ${config.color}`} />
              <div>
                <p className={`text-2xl font-bold ${config.color}`}>{score}</p>
                <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
              </div>
            </div>
          </div>
          <Progress value={score} className="h-2" />
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
