import { useState, useEffect } from 'react';
import { useFocusSessionTimer } from '../hooks/useFocusSessionTimer';
import { useDistractionLogger } from '../hooks/useDistractionLogger';
import { useActivityTransitions } from '../hooks/useActivityTransitions';
import { useActor } from '../hooks/useActor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DistractionLogModal } from '../components/DistractionLogModal';
import { FocusSessionSummary } from '../components/FocusSessionSummary';
import { Clock, Play, Pause, RotateCcw, AlertTriangle, Coffee } from 'lucide-react';
import { toast } from 'sonner';

const PRESET_WORK_DURATIONS = [15, 25, 45];
const PRESET_BREAK_DURATIONS = [5, 10, 15];

export default function FocusSession() {
  const {
    duration,
    remainingTime,
    isActive,
    isPaused,
    isCompleted,
    isBreakMode,
    breakDuration,
    startWorkSession,
    startBreakSession,
    pauseSession,
    resumeSession,
    resetSession,
    formattedTime,
    setBreakDuration: setBreakDurationState,
  } = useFocusSessionTimer();

  const {
    showModal,
    openModal,
    closeModal,
    logDistraction,
    distractionCount,
  } = useDistractionLogger();

  const { recordTransition, currentActivity, setCurrentActivity } = useActivityTransitions();
  const { actor } = useActor();

  const [customDuration, setCustomDuration] = useState<string>('');
  const [selectedBreakDuration, setSelectedBreakDuration] = useState<number>(5);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

  const handleStartWorkSession = async (minutes: number) => {
    if (actor) {
      try {
        await actor.startSession();
        setSessionStartTime(Date.now());
        startWorkSession(minutes);
        toast.success(`Work session started: ${minutes} minutes`, {
          description: 'Stay focused! Log any distractions as they occur.',
        });
      } catch (error) {
        console.error('Failed to start session:', error);
        toast.error('Failed to start session');
      }
    }
  };

  const handleCustomStart = () => {
    const minutes = parseInt(customDuration);
    if (isNaN(minutes) || minutes <= 0) {
      toast.error('Please enter a valid duration');
      return;
    }
    handleStartWorkSession(minutes);
    setCustomDuration('');
  };

  const handleStartBreak = () => {
    startBreakSession(selectedBreakDuration);
    toast.success(`Break started: ${selectedBreakDuration} minutes`, {
      description: 'Take a well-deserved break!',
    });
  };

  const handleReset = async () => {
    if (isCompleted && actor && sessionStartTime > 0) {
      try {
        await actor.endSession();
        toast.success('Session recorded successfully!');
      } catch (error) {
        console.error('Failed to record session:', error);
        toast.error('Failed to record session');
      }
    }

    resetSession();
    setShowSummary(false);
    setSessionStartTime(0);
  };

  const handleLogDistraction = async (
    source: string,
    category: 'productive' | 'distracting' | 'neutral',
    sourceType: string,
    description: string
  ) => {
    await logDistraction(source, category, sourceType, description);
    
    // Record transition if we have a current activity
    if (currentActivity) {
      await recordTransition(
        currentActivity.name,
        source,
        currentActivity.category,
        category
      );
    }
    
    // Update current activity
    setCurrentActivity({ name: source, category });
    
    toast.success('Distraction logged', {
      description: 'Keep going! You can do this.',
    });
  };

  // Show summary when session completes
  useEffect(() => {
    if (isCompleted && !showSummary && !isBreakMode) {
      setShowSummary(true);
    }
  }, [isCompleted, showSummary, isBreakMode]);

  // Auto-start break after work session completes
  useEffect(() => {
    if (isCompleted && !isBreakMode && !showSummary) {
      const timer = setTimeout(() => {
        handleStartBreak();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, isBreakMode, showSummary]);

  const progress = duration > 0 ? ((duration - remainingTime) / duration) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Focus Session</h1>
        <p className="text-muted-foreground">
          Productivity timer with manual distraction logging
        </p>
      </div>

      {!isActive && !isCompleted ? (
        <Card>
          <CardHeader>
            <CardTitle>Start a Focus Session</CardTitle>
            <CardDescription>Choose a work duration to begin your focused session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Preset Durations</h3>
              <div className="grid grid-cols-3 gap-3">
                {PRESET_WORK_DURATIONS.map((minutes) => (
                  <Button
                    key={minutes}
                    variant="outline"
                    size="lg"
                    onClick={() => handleStartWorkSession(minutes)}
                    className="h-20 flex flex-col gap-1"
                  >
                    <Clock className="h-5 w-5" />
                    <span className="text-lg font-bold">{minutes} min</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Custom Duration</h3>
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Enter minutes"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomStart()}
                  min="1"
                />
                <Button onClick={handleCustomStart} className="gap-2">
                  <Play className="h-4 w-4" />
                  Start
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Break Duration</h3>
              <div className="grid grid-cols-3 gap-3">
                {PRESET_BREAK_DURATIONS.map((minutes) => (
                  <Button
                    key={minutes}
                    variant={selectedBreakDuration === minutes ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedBreakDuration(minutes);
                      setBreakDurationState(minutes);
                    }}
                  >
                    {minutes} min
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : isActive || isPaused ? (
        <div className="space-y-6">
          {/* Timer Display */}
          <Card className={isBreakMode ? 'border-green-500/50 bg-green-500/5' : 'border-primary/50 bg-primary/5'}>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  {isBreakMode ? (
                    <>
                      <Coffee className="h-6 w-6 text-green-600" />
                      <Badge variant="outline" className="text-lg px-4 py-1 border-green-500 text-green-600">
                        Break Time
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Clock className="h-6 w-6 text-primary" />
                      <Badge variant="outline" className="text-lg px-4 py-1 border-primary">
                        Work Session
                      </Badge>
                    </>
                  )}
                </div>
                
                <div className="text-7xl font-bold tracking-tight">
                  {formattedTime}
                </div>

                <Progress value={progress} className="h-3" />

                <div className="flex items-center justify-center gap-3">
                  {isPaused ? (
                    <Button size="lg" onClick={resumeSession} className="gap-2">
                      <Play className="h-5 w-5" />
                      Resume
                    </Button>
                  ) : (
                    <Button size="lg" onClick={pauseSession} variant="outline" className="gap-2">
                      <Pause className="h-5 w-5" />
                      Pause
                    </Button>
                  )}
                  <Button size="lg" onClick={handleReset} variant="destructive" className="gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distraction Logging - Only show during work sessions */}
          {!isBreakMode && (
            <Card>
              <CardHeader>
                <CardTitle>Log Distractions</CardTitle>
                <CardDescription>
                  Click below when you get distracted to track interruption patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Distractions logged this session: <span className="font-bold text-foreground">{distractionCount}</span>
                    </p>
                  </div>
                  <Button onClick={openModal} variant="outline" className="gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Log Distraction
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}

      {/* Distraction Log Modal */}
      <DistractionLogModal
        open={showModal}
        onClose={closeModal}
        onSubmit={handleLogDistraction}
      />

      {/* Session Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Session Complete! 🎉</DialogTitle>
            <DialogDescription>
              Great work! Here's your session summary.
            </DialogDescription>
          </DialogHeader>
          <FocusSessionSummary
            duration={duration}
            distractionsCount={distractionCount}
          />
          <div className="flex gap-3">
            <Button onClick={handleStartBreak} className="flex-1 gap-2">
              <Coffee className="h-4 w-4" />
              Take Break ({selectedBreakDuration}m)
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Finish
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
