
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AgentPage from "./pages/AgentPage";
import ActivityPage from "./pages/ActivityPage";
import AgentsPage from "./pages/AgentsPage";
import { AgentProvider } from "./contexts/AgentContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ActivityProvider } from "./contexts/ActivityContext";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import UpdatePassword from "./pages/auth/UpdatePassword";
import Profile from "./pages/Profile";
import { AuthLayout } from "./pages/auth/AuthLayout";

// Create a query client instance OUTSIDE the component to avoid recreating it on re-renders
// but ensure it's not in a hook context that could cause issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// App function component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <TooltipProvider>
            <AuthProvider>
              <AgentProvider>
                <ActivityProvider>
                  <Routes>
                    {/* Auth Routes */}
                    <Route path="/auth">
                      <Route path="login" element={<Login />} />
                      <Route path="signup" element={
                        <AuthLayout>
                          <Signup />
                        </AuthLayout>
                      } />
                      <Route path="forgot-password" element={
                        <AuthLayout>
                          <ForgotPassword />
                        </AuthLayout>
                      } />
                      <Route path="update-password" element={
                        <AuthLayout>
                          <UpdatePassword />
                        </AuthLayout>
                      } />
                    </Route>

                    {/* Protected Dashboard Routes */}
                    <Route element={
                      <AuthLayout requireAuth redirectTo="/auth/login">
                        <DashboardLayout />
                      </AuthLayout>
                    }>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/agents" element={<AgentsPage />} />
                      <Route path="/agent/:agentId" element={<AgentPage />} />
                      <Route path="/activities" element={<ActivityPage />} />
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                  <Sonner />
                </ActivityProvider>
              </AgentProvider>
            </AuthProvider>
          </TooltipProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
