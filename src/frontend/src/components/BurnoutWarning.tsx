import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { COPY } from '@/lib/copyConstants';

interface BurnoutWarningProps {
  burnoutIndex: number;
  onDismiss: () => void;
}

/**
 * BurnoutWarning component displays when burnout reaches medium threshold (30+)
 * 
 * Features:
 * - Shows current burnout index number
 * - Suggests desk recovery break
 * - Dismissible with button
 * - Reappears if burnout increases by 10+ points after dismissal
 * - Positioned at bottom-right to avoid blocking UI
 */
export function BurnoutWarning({ burnoutIndex, onDismiss }: BurnoutWarningProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-md transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      <Card className="border-amber-500/50 bg-amber-500/5 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold mb-1">{COPY.warnings.firstThreshold.title}</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Your burnout index is at <strong>{burnoutIndex.toFixed(1)}</strong>. {COPY.warnings.firstThreshold.message}
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                {COPY.warnings.firstThreshold.suggestion}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleDismiss}>
                  I'll keep working
                </Button>
                <Button size="sm" asChild>
                  <a href="/desk-recovery">Take a break</a>
                </Button>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={handleDismiss} className="shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
