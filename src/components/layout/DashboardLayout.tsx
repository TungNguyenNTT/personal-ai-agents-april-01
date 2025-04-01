
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { InteractionWidget } from "../InteractionWidget";
import { Button } from "@/components/ui/button";
import { MessageSquare, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "../ThemeToggle";

export const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [interactionWidgetOpen, setInteractionWidgetOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Set sidebar collapsed based on screen size
  useEffect(() => {
    setSidebarCollapsed(isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const toggleInteractionWidget = () => {
    setInteractionWidgetOpen(!interactionWidgetOpen);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Overlay for mobile menu */}
      {mobileMenuOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        isMobileOpen={mobileMenuOpen}
        toggleSidebar={toggleSidebar} 
      />
      <main className="flex flex-col flex-1 w-full overflow-hidden">
        <div className="flex items-center justify-between p-1 border-b border-border">
          <div className="flex items-center flex-1 gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
            {/* Page title area with a stable ID */}
            <div id="page-title" className="flex-1"></div>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex-1 overflow-auto w-full">
          <Outlet />
        </div>
        
        {/* Interaction Widget */}
        <InteractionWidget 
          isOpen={interactionWidgetOpen} 
          onClose={() => setInteractionWidgetOpen(false)} 
        />
        
        {/* Interaction Widget Toggle Button - positioned below widget when open */}
        <Button 
          variant="outline" 
          size="icon" 
          className={`fixed ${interactionWidgetOpen ? "bottom-4" : "bottom-8"} right-4 h-10 w-10 rounded-full shadow-md z-50 bg-primary text-primary-foreground transition-all duration-300`}
          onClick={toggleInteractionWidget}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </main>
    </div>
  );
};
