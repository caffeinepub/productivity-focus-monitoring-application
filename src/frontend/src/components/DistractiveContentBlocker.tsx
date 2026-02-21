import { useFocusSessionViolations } from '../hooks/useFocusSessionViolations';
import { useFocusSessionTimer } from '../hooks/useFocusSessionTimer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function DistractiveContentBlocker() {
  const { isLocked, sessionRemainingTime } = useFocusSessionViolations();
  const { formatTime, duration } = useFocusSessionTimer();

  if (!isLocked) {
    return null;
  }

  const progress = duration > 0 ? ((duration - sessionRemainingTime) / duration) * 100 : 0;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Lock className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Content Locked</CardTitle>
          <CardDescription>
            This section is restricted during your focus session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Focus Session Active</AlertTitle>
            <AlertDescription>
              You've exceeded the violation limit. This distractive content is locked until your focus session completes.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Time until unlock</span>
              <span className="font-mono font-semibold text-lg">{formatTime(sessionRemainingTime)}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-semibold text-sm">💡 Stay Productive</h4>
            <p className="text-sm text-muted-foreground">
              Use this time to focus on your productive tasks. Once your session completes, all restrictions will be lifted.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
