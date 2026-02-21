import { useState } from 'react';
import { useFocusSessionTimer } from '../hooks/useFocusSessionTimer';
import { useFocusSessionViolations } from '../hooks/useFocusSessionViolations';
import { useActor } from '../hooks/useActor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FocusSessionSummary } from '../components/FocusSessionSummary';
import { Clock, Play, Pause, RotateCcw, AlertTriangle, Target } from 'lucide-react';
import { toast } from 'sonner';

const PRESET_DURATIONS = [25, 45, 60, 90];

export default function FocusSession() {
  const {
    duration,
    remainingTime,
    isActive,
    isPaused,
    isCompleted,
    startSession,
    pauseSession,
    resumeSession,
    resetSession,
    formattedTime,
  } = useFocusSessionTimer();

  const { violations, violationCount, grayscale, warningCycle } = useFocusSessionViolations();
  const { actor } = useActor();

  const [customDuration, setCustomDuration] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);

  const handleStartSession = (minutes: number) => {
    startSession(minutes);
    toast.success(`Focus session started: ${minutes} minutes`, {
      description: 'Stay focused on productive tasks!',
    });
  };

  const handleCustomStart = () => {
    const minutes = parseInt(customDuration);
    if (isNaN(minutes) || minutes <= 0) {
      toast.error('Please enter a valid duration');
      return;
    }
    handleStartSession(minutes);
    setCustomDuration('');
  };

  const handleReset = async () => {
    if (isCompleted && actor) {
      // Calculate focus score
      const focusScore = Math.max(0, 100 - violationCount * 10);

      // Record session to backend
      try {
        await actor.recordFocusSession(
          BigInt(duration),
          true,
          BigInt(focusScore)
        );
        toast.success('Session recorded successfully!');
      } catch (error) {
        console.error('Failed to record focus session:', error);
        toast.error('Failed to record session');
      }
    }

    resetSession();
    setShowSummary(false);
  };

  // Show summary when session completes
  if (isCompleted && !showSummary) {
    setShowSummary(true);
  }

  const progress = duration > 0 ? ((duration - remainingTime) / duration) * 100 : 0;
  const focusScore = Math.max(0, 100 - violationCount * 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Focus Session</h1>
        <p className="text-muted-foreground">
          Set a timer and stay focused on productive tasks
        </p>
      </div>

      {!isActive && !isCompleted ? (
        <Card>
          <CardHeader>
            <CardTitle>Start a Focus Session</CardTitle>
            <CardDescription>Choose a duration to begin your focused work session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Preset Durations</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PRESET_DURATIONS.map((minutes) => (
                  <Button
                    key={minutes}
                    variant="outline"
                    size="lg"
                    onClick={() => handleStartSession(minutes)}
                    className="h-20 flex flex-col gap-1"
                  >
                    <Clock className="h-5 w-5" />
                    <span className="text-lg font-bold">{minutes}</span>
                    <span className="text-xs text-muted-foreground">minutes</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Custom Duration</h3>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter minutes"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  min="1"
                  className="flex-1"
                />
                <Button onClick={handleCustomStart} size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="font-semibold text-sm">📋 How it works</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Navigate between productive and distractive sections</li>
                <li>Get 3 warnings before grayscale mode activates</li>
                <li>Grayscale lasts 2 minutes, then warnings reset</li>
                <li>Excessive violations lock distractive content</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Session Timer
              </CardTitle>
              <CardDescription>
                {isCompleted ? 'Session completed!' : 'Time remaining in your focus session'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold font-mono mb-2">{formattedTime}</div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex gap-2 justify-center">
                {!isCompleted && (
                  <>
                    {isPaused ? (
                      <Button onClick={resumeSession} size="lg">
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    ) : (
                      <Button onClick={pauseSession} size="lg" variant="secondary">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    )}
                  </>
                )}
                <Button onClick={handleReset} size="lg" variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {isCompleted ? 'Start New Session' : 'Reset'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Session Stats
              </CardTitle>
              <CardDescription>Track your focus performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Violations</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold">{violationCount}</p>
                    <Badge variant={violationCount >= 3 ? 'destructive' : 'secondary'}>
                      {violationCount >= 3 ? 'High' : 'Low'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Focus Score</p>
                  <p className="text-3xl font-bold">{focusScore}%</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Warning Cycle</p>
                  <p className="text-3xl font-bold">{warningCycle}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Grayscale</p>
                  <Badge variant={grayscale.isActive ? 'destructive' : 'secondary'}>
                    {grayscale.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {grayscale.isActive && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-destructive mb-1">
                    <AlertTriangle className="h-4 w-4" />
                    Grayscale Warning Active
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Resets in: <span className="font-mono font-semibold">{Math.floor(grayscale.remainingSeconds / 60)}:{(grayscale.remainingSeconds % 60).toString().padStart(2, '0')}</span>
                  </p>
                </div>
              )}

              {violations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Recent Violations</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {violations.slice(-5).reverse().map((violation, index) => (
                      <div
                        key={index}
                        className="text-xs text-muted-foreground flex items-center justify-between py-1 px-2 rounded bg-muted"
                      >
                        <span>Productive → Distractive</span>
                        <span className="font-mono">
                          {new Date(violation.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Focus Session Complete! 🎉</DialogTitle>
            <DialogDescription>
              Great job completing your focus session. Here's your performance summary.
            </DialogDescription>
          </DialogHeader>
          <FocusSessionSummary
            duration={duration}
            violationCount={violationCount}
            warningCycles={warningCycle}
            focusScore={focusScore}
          />
          <div className="flex justify-end gap-2">
            <Button onClick={handleReset} size="lg">
              Start New Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
