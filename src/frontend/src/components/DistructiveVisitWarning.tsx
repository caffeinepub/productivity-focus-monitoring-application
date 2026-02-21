import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { WarningLevel } from '@/hooks/useDistractionWarnings';

interface DistructiveVisitWarningProps {
  level: WarningLevel;
  visible: boolean;
  onDismiss: () => void;
}

const WARNING_CONTENT = {
  1: {
    title: 'Gentle Reminder',
    message: "You've visited a few distractive sites. Let's try to stay focused on your goals.",
    variant: 'default' as const,
  },
  2: {
    title: 'Focus Check-In',
    message: "You're getting distracted more frequently. Consider what's pulling your attention away.",
    variant: 'default' as const,
  },
  3: {
    title: 'Final Warning',
    message: 'One more distractive visit will activate a focus lock to help you regain concentration.',
    variant: 'destructive' as const,
  },
};

export function DistructiveVisitWarning({ level, visible, onDismiss }: DistructiveVisitWarningProps) {
  if (!visible || level === 0) return null;

  const content = WARNING_CONTENT[level];

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <Alert variant={content.variant} className="shadow-lg">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="flex items-center justify-between">
          {content.title}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertTitle>
        <AlertDescription className="mt-2">
          {content.message}
        </AlertDescription>
      </Alert>
    </div>
  );
}
