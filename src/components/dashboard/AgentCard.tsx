
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Play, Pause, RefreshCw, AlertCircle, ActivityIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AgentStatus = "active" | "idle" | "error" | "offline";

interface AgentCardProps {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: AgentStatus;
  lastActivity?: string;
  capabilities: string[];
}

export const AgentCard = ({
  id,
  name,
  description,
  icon: Icon,
  status,
  lastActivity,
  capabilities,
}: AgentCardProps) => {
  const [currentStatus, setCurrentStatus] = useState<AgentStatus>(status);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "idle":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status: AgentStatus) => {
    switch (status) {
      case "active":
        return "Active";
      case "idle":
        return "Idle";
      case "error":
        return "Error";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  const toggleStatus = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      if (currentStatus === "active") {
        setCurrentStatus("idle");
      } else if (currentStatus === "idle" || currentStatus === "offline" || currentStatus === "error") {
        setCurrentStatus("active");
      }
      setIsLoading(false);
    }, 1000);
  };

  const restartAgent = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setCurrentStatus("active");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Card className="h-full transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-muted">
              <Icon className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">{name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Agent Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/agent/${id}`}>Configure</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/activities?agent=${id}`}>View Activity</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Connect to Services</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">Disconnect</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className={cn("h-2 w-2 rounded-full", getStatusColor(currentStatus))} />
          <CardDescription>{getStatusText(currentStatus)}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        {lastActivity && (
          <p className="text-xs text-muted-foreground mt-2">
            Last activity: {lastActivity}
          </p>
        )}
        <div className="flex flex-wrap gap-1 mt-3">
          {capabilities.map((capability, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {capability}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex flex-wrap gap-2 w-full justify-between">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleStatus}
            disabled={isLoading}
            className="flex-grow sm:flex-grow-0"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : currentStatus === "active" ? (
              <>
                <Pause className="h-4 w-4 mr-1" /> Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" /> Start
              </>
            )}
          </Button>
          
          {currentStatus === "error" && (
            <Button
              size="sm"
              variant="outline"
              onClick={restartAgent}
              disabled={isLoading}
              className="flex-grow sm:flex-grow-0"
            >
              <AlertCircle className="h-4 w-4 mr-1" /> 
              Resolve
            </Button>
          )}
          
          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="flex-grow sm:flex-grow-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link to={`/agent/${id}`}>Configure</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/activities?agent=${id}`}>
                    <ActivityIcon className="h-4 w-4 mr-2" />
                    Activity
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button size="sm" variant="outline" asChild className="flex-grow sm:flex-grow-0">
                <Link to={`/agent/${id}`}>
                  Configure
                </Link>
              </Button>
              
              <Button size="sm" variant="outline" asChild className="flex-grow sm:flex-grow-0">
                <Link to={`/activities?agent=${id}`}>
                  <ActivityIcon className="h-4 w-4 mr-1" />
                  Activity
                </Link>
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
