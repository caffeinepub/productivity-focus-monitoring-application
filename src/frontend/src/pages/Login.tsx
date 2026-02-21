import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Loader2, Shield } from 'lucide-react';

export default function Login() {
  const { login, loginStatus, identity, isInitializing, isLoginError } = useInternetIdentity();
  const navigate = useNavigate();

  const isLoggingIn = loginStatus === 'logging-in';

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (identity && !identity.getPrincipal().isAnonymous()) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
            <Activity className="h-10 w-10 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Focus Guardian</CardTitle>
            <CardDescription className="text-base mt-2">
              Your personal productivity coach
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="shrink-0 mt-0.5">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">Track Your Focus</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your productivity patterns and stay on track with real-time insights.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="shrink-0 mt-0.5">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">Prevent Burnout</h3>
                <p className="text-sm text-muted-foreground">
                  Get gentle reminders to take breaks and maintain healthy work habits.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="shrink-0 mt-0.5">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">Build Better Habits</h3>
                <p className="text-sm text-muted-foreground">
                  Earn achievements and track your progress toward sustainable productivity.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            size="lg"
            className="w-full"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Sign in to Get Started'
            )}
          </Button>

          {isLoginError && (
            <p className="text-sm text-destructive text-center">
              Login failed. Please try again.
            </p>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Secure authentication powered by Internet Identity
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
