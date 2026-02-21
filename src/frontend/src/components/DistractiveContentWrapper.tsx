import { useFocusSessionViolations } from '../hooks/useFocusSessionViolations';
import { cn } from '@/lib/utils';

interface DistractiveContentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function DistractiveContentWrapper({ children, className }: DistractiveContentWrapperProps) {
  const { grayscale, isCurrentRouteDistractive, formatGrayscaleTime } = useFocusSessionViolations();

  const shouldApplyGrayscale = grayscale.isActive && isCurrentRouteDistractive;

  return (
    <div className={cn('relative', className)}>
      {shouldApplyGrayscale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-6 shadow-lg pointer-events-auto">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-destructive">⚠️ Grayscale Warning Active</h3>
              <p className="text-sm text-muted-foreground">
                You've exceeded your violation limit. Focus on productive tasks.
              </p>
              <div className="text-3xl font-bold text-primary">
                {formatGrayscaleTime}
              </div>
              <p className="text-xs text-muted-foreground">
                Time remaining until reset
              </p>
            </div>
          </div>
        </div>
      )}
      <div
        className={cn(
          'transition-all duration-500',
          shouldApplyGrayscale && 'grayscale'
        )}
      >
        {children}
      </div>
    </div>
  );
}
