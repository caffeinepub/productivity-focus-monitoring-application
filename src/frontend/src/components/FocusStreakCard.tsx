import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame } from 'lucide-react';

interface FocusStreakCardProps {
  streak: number;
}

export function FocusStreakCard({ streak }: FocusStreakCardProps) {
  const getMilestoneMessage = (days: number) => {
    if (days >= 30) return '🏆 Incredible dedication!';
    if (days >= 14) return '🌟 You\'re on fire!';
    if (days >= 7) return '🎯 One week strong!';
    if (days >= 3) return '💪 Building momentum!';
    if (days >= 1) return '🚀 Great start!';
    return '👋 Start your streak today!';
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Focus Streak
          </CardTitle>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {streak} {streak === 1 ? 'day' : 'days'}
          </Badge>
        </div>
        <CardDescription>
          Consecutive days with completed focus sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-lg font-medium">
          {getMilestoneMessage(streak)}
        </p>
      </CardContent>
    </Card>
  );
}
