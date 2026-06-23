import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { LockKeyhole } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, login } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-lg text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48 mx-auto" />
          <div className="h-4 bg-muted rounded w-72 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-lg text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <LockKeyhole className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold mb-2">Sign in to continue</h2>
            <p className="text-muted-foreground">
              You need to be signed in to access this page.
            </p>
          </div>
          <Button onClick={login} size="lg" className="px-8">
            Log in
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
