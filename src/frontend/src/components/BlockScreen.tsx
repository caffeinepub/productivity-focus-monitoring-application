import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, Clock } from 'lucide-react';

interface BlockScreenProps {
  timeRemaining: number;
  onComplete: () => void;
}

export function BlockScreen({ timeRemaining, onComplete }: BlockScreenProps) {
  const totalTime = 25 * 60;
  const progress = ((totalTime - timeRemaining) / totalTime) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <Card className="max-w-lg w-full mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Focus Session Required</CardTitle>
          <CardDescription>
            Complete a productive work session to unlock distracting applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <p className="text-4xl font-bold">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">remaining</p>
          </div>

          <Progress value={progress} className="h-3" />

          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="text-center">
              This gentle intervention helps you rebuild focus momentum. Use this time to work on
              productive tasks.
            </p>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-medium text-foreground mb-2">Tips for this session:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Close unnecessary tabs and applications</li>
                <li>Focus on a single task</li>
                <li>Minimize context switching</li>
                <li>Take deep breaths if you feel restless</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
