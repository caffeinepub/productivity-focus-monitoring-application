import { Progress } from '@/components/ui/progress';
import { Lock } from 'lucide-react';

interface FocusLockOverlayProps {
  remainingTime: number;
  lockDuration: number;
  formattedTime: string;
  reason: string;
}

export function FocusLockOverlay({ remainingTime, lockDuration, formattedTime, reason }: FocusLockOverlayProps) {
  const progress = lockDuration > 0 ? ((lockDuration - remainingTime) / lockDuration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4 space-y-8 text-center">
        {/* Lock Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative bg-primary/10 rounded-full p-8">
              <Lock className="h-24 w-24 text-primary" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Focus Lock Active</h1>
          <p className="text-lg text-muted-foreground">
            Time to reset and refocus on what matters
          </p>
        </div>

        {/* Timer */}
        <div className="space-y-4">
          <div className="text-6xl font-bold tabular-nums tracking-tight">
            {formattedTime}
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Reason */}
        <div className="bg-muted/50 rounded-lg p-6 space-y-2">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Why This Lock?
          </h3>
          <p className="text-lg">{reason}</p>
          <p className="text-sm text-muted-foreground mt-4">
            This lock helps you break the distraction cycle and rebuild your focus. Use this time to reflect on your productivity goals.
          </p>
        </div>

        {/* Supportive Message */}
        <div className="space-y-2">
          <p className="text-muted-foreground">
            💪 You've got this! This is an opportunity to strengthen your focus habits.
          </p>
          <p className="text-sm text-muted-foreground">
            The lock will automatically release when the timer completes.
          </p>
        </div>
      </div>
    </div>
  );
}
