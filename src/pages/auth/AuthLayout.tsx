
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const AuthLayout = ({ 
  children, 
  requireAuth = false, 
  redirectTo = "/auth/login" 
}: AuthLayoutProps) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect based on authentication requirements
  if (requireAuth && !user) {
    // User not authenticated but page requires auth
    return <Navigate to={redirectTo} replace />;
  } else if (!requireAuth && user) {
    // User is authenticated but page doesn't require auth (like login page)
    return <Navigate to="/activities" replace />;
  }

  // Return children if conditions are met
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex items-center justify-center px-3 sm:px-6 py-8 sm:py-12">
        {children}
      </main>
      <footer className="py-4 sm:py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Your App. All rights reserved.</p>
      </footer>
    </div>
  );
};
