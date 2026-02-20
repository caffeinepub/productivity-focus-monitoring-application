import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SwitchingBreakdownProps {
  productiveToProductive: number;
  productiveToDistracting: number;
  distractingToProductive: number;
  distractingToDistracting: number;
}

export function SwitchingBreakdown({
  productiveToProductive,
  productiveToDistracting,
  distractingToProductive,
  distractingToDistracting,
}: SwitchingBreakdownProps) {
  // Calculate total switches and percentages
  const totalSwitches = 
    productiveToProductive + 
    productiveToDistracting + 
    distractingToProductive + 
    distractingToDistracting;

  const calculatePercentage = (count: number) => {
    if (totalSwitches === 0) return 0;
    return Math.round((count / totalSwitches) * 100);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Website Switching Breakdown</h3>
        <p className="text-sm text-muted-foreground">
          Real-time categorization of your tab switches between productive and distracting websites
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Productive to Productive */}
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <CardTitle className="text-sm font-medium">Productive → Productive</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {productiveToProductive}
              </p>
              <p className="text-xs text-muted-foreground">
                {calculatePercentage(productiveToProductive)}% of total switches
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                Great focus maintenance!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Productive to Distracting */}
        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-sm font-medium">Productive → Distracting</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {productiveToDistracting}
              </p>
              <p className="text-xs text-muted-foreground">
                {calculatePercentage(productiveToDistracting)}% of total switches
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                Watch out - losing focus
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Distracting to Productive */}
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
              <CardTitle className="text-sm font-medium">Distracting → Productive</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {distractingToProductive}
              </p>
              <p className="text-xs text-muted-foreground">
                {calculatePercentage(distractingToProductive)}% of total switches
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                Good - returning to work!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Distracting to Distracting */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <CardTitle className="text-sm font-medium">Distracting → Distracting</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {distractingToDistracting}
              </p>
              <p className="text-xs text-muted-foreground">
                {calculatePercentage(distractingToDistracting)}% of total switches
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                Deep distraction detected
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {totalSwitches === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">No website switches detected yet</p>
          <p className="text-xs mt-1">Switch between tabs to see categorized data appear here</p>
        </div>
      )}
    </div>
  );
}
