
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const AuthStatus = () => {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Status</CardTitle>
        <CardDescription>Your current authentication status</CardDescription>
      </CardHeader>
      <CardContent>
        {user ? (
          <div className="space-y-4">
            <div>
              <p className="font-semibold">Logged in as:</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div>
              <p className="font-semibold">User ID:</p>
              <p className="text-muted-foreground truncate">{user.id}</p>
            </div>
            <Button asChild className="w-full mt-4">
              <Link to="/profile">View Profile</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p>You are not logged in</p>
            <div className="flex gap-2">
              <Button asChild variant="default">
                <Link to="/auth/login">Sign In</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/auth/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
