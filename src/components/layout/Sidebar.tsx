
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Settings,
  Bot,
  Activity as ActivityIcon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Activities", href: "/activities", icon: ActivityIcon, active: false },
  { name: "Dashboard", href: "/", icon: LayoutDashboard, active: false },
  { name: "Agents", href: "/agents", icon: Bot, active: false },
  { name: "Settings", href: "/settings", icon: Settings, active: false },
  { name: "Profile", href: "/profile", icon: User, active: false },
];

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen?: boolean;
  toggleSidebar: () => void;
}

export const Sidebar = ({ isCollapsed, isMobileOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(
    navigation.find((item) => item.href === location.pathname) || navigation[0]
  );
  const { user, signOut } = useAuth();

  const handleNavigation = (item: { name: string; href: string; icon: any; active: boolean }) => {
    setActiveItem(item);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div
      className={cn(
        "h-screen flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[60px]" : "w-[200px]",
        // Add mobile styles
        "fixed z-50 md:relative",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex items-center justify-between p-4 h-16">
        {!isCollapsed && <h2 className="text-lg font-semibold">Menu</h2>}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto">
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                "w-full justify-start font-normal mb-1",
                isCollapsed ? "px-2" : "px-3",
                activeItem?.name === item.name 
                  ? "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary" 
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
              onClick={() => handleNavigation(item)}
              asChild
            >
              <Link to={item.href} className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-start")}>
                <item.icon className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-2")} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </Button>
          ))}
          
          {/* Logout button added to main navigation */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start font-normal mb-1 text-muted-foreground hover:bg-primary/10 hover:text-primary",
              isCollapsed ? "px-2" : "px-3"
            )}
            onClick={handleSignOut}
          >
            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-start")}>
              <LogOut className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-2")} />
              {!isCollapsed && <span>Logout</span>}
            </div>
          </Button>
        </nav>
      </div>

      <div className="p-4">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-start")}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name || user?.email} />
            <AvatarFallback>{getInitials(user?.user_metadata?.full_name)}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="ml-2 truncate">
              <p className="text-sm font-medium truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
