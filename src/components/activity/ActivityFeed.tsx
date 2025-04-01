import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Check, Clock, Eye, EyeOff, Info, MessageSquare, MoreHorizontal, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useToast } from "@/hooks/use-toast";
import { ActivityDetailsDialog } from "./ActivityDetailsDialog";
import { useActivity, Activity as ContextActivity, ActivityType as ContextActivityType, ActivityStatus as ContextActivityStatus } from "@/contexts/ActivityContext";
import { getAgentDotColor, getActivityTypeColor } from "./activityUtils";

export type ActivityType = "message" | "task" | "alert" | "update" | "query";

export interface Activity {
  id: string;
  type: ActivityType;
  agent: string;
  agentId: string;
  content: string;
  detailedContent?: string;
  timestamp: Date;
  read: boolean;
  dismissed?: boolean;
  status?: "completed" | "pending" | "failed" | "urgent";
  priority?: "low" | "medium" | "high" | "urgent";
}

export interface ActivityFeedProps {
  agentFilter?: string;
  typeFilter?: string;
  agents?: Array<{ id: string; name: string }>;
  onAgentFilterChange?: (value: string) => void;
  onTypeFilterChange?: (value: string) => void;
}

const getActivityTypeIcon = (type: string) => {
  switch (type) {
    case "message":
      return <MessageSquare className="h-4 w-4" />;
    case "task":
      return <Clock className="h-4 w-4" />;
    case "alert":
      return <AlertCircle className="h-4 w-4" />;
    case "update":
      return <Info className="h-4 w-4" />;
    case "query":
      return <MessageSquare className="h-4 w-4" />;
    case "action":
      return <Clock className="h-4 w-4" />;
    case "notification":
      return <Info className="h-4 w-4" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case "success":
      return <Check className="h-4 w-4 text-green-500" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

const getStatusBadgeColor = (status?: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-300";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "failed":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const convertActivityType = (contextActivity: ContextActivity): Activity => {
  const { type, status, priority, ...rest } = contextActivity;
  
  let activityType: ActivityType = "message";
  if (type === "message" || type === "task" || type === "alert" || type === "update" || type === "query") {
    activityType = type as ActivityType;
  }
  
  let convertedStatus: "completed" | "pending" | "failed" | "urgent" | undefined = undefined;
  if (status === "completed" || status === "pending") {
    convertedStatus = status;
  } else if (status === "in-progress") {
    convertedStatus = "pending";
  } else if (status === "failed" || status === "error") {
    convertedStatus = "failed";
  } else if (status === "urgent") {
    convertedStatus = "urgent";
  }
  
  let convertedPriority: "low" | "medium" | "high" | "urgent" | undefined = undefined;
  if (priority === "low" || priority === "medium" || priority === "high" || priority === "urgent") {
    convertedPriority = priority;
  }
  
  return {
    ...rest,
    type: activityType,
    status: convertedStatus,
    priority: convertedPriority,
    read: contextActivity.read ?? false
  };
};

export const ActivityFeed = ({ 
  agentFilter = "all", 
  typeFilter = "all", 
  agents = [],
  onAgentFilterChange,
  onTypeFilterChange
}: ActivityFeedProps) => {
  const { activities: contextActivities, dismissActivity, updateActivity } = useActivity();
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const activitiesEndRef = useRef<HTMLDivElement>(null);
  
  const activities = contextActivities.map(convertActivityType);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollableNode = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollableNode) {
        scrollableNode.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  }, [activities]);
  
  const viewActivityDetails = (activity: Activity) => {
    setSelectedActivity(activity);
    setTimeout(() => {
      setDetailsDialogOpen(true);
    }, 0);
    
    if (!activity.read) {
      markAsRead(activity.id);
    }
  };
  
  const handleDialogOpenChange = (open: boolean) => {
    setDetailsDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setSelectedActivity(null);
      }, 300);
    }
  };
  
  const refreshActivities = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        description: "Activities refreshed",
      });
    }, 1000);
  };
  
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  const markAsRead = (id: string) => {
    updateActivity(id, { read: true });
  };
  
  const markAsUnread = (id: string) => {
    updateActivity(id, { read: false });
  };
  
  const markAllAsRead = () => {
    activities.forEach(activity => {
      if (!activity.read) {
        updateActivity(activity.id, { read: true });
      }
    });
  };

  const filteredActivities = activities
    .filter(activity => !activity.dismissed)
    .filter(activity => {
      const matchesAgent = agentFilter === "all" || activity.agentId === agentFilter;
      const matchesType = typeFilter === "all" || activity.type === typeFilter;
      return matchesAgent && matchesType;
    });

  const unreadCount = filteredActivities.filter(a => !a.read).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshActivities}
            disabled={loading}
            className="whitespace-nowrap"
          >
            <RefreshCw className={cn("h-4 w-4 mr-1", loading && "animate-spin")} />
            Refresh
          </Button>
          
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={markAllAsRead}
              className="whitespace-nowrap"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all as read
            </Button>
          )}
          
          <Select value={agentFilter} onValueChange={onAgentFilterChange || (() => {})}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="Filter by agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={onTypeFilterChange || (() => {})}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="message">Messages</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="alert">Alerts</SelectItem>
              <SelectItem value="update">Updates</SelectItem>
              <SelectItem value="query">Queries</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Badge variant="outline" className="ml-auto whitespace-nowrap px-2.5 py-0.5 text-xs md:text-sm">
          {unreadCount} unread
        </Badge>
      </div>
      
      <ScrollArea ref={scrollAreaRef} className="h-[500px] pr-2">
        <div className="space-y-2">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              <p>No activities to display</p>
              <p className="text-sm">Try changing your filter settings</p>
            </div>
          ) : (
            <>
              {filteredActivities.map((activity) => (
                <ContextMenu key={activity.id}>
                  <ContextMenuTrigger>
                    <div
                      className={cn(
                        "flex items-start gap-2 rounded-md p-2 transition-colors border",
                        activity.read 
                          ? "bg-background border-border/50 opacity-75" 
                          : "bg-muted/30 border-border"
                      )}
                    >
                      <div
                        className={cn(
                          "mt-1 h-2 w-2 flex-shrink-0 rounded-full",
                          activity.agentId 
                            ? getAgentDotColor(activity.agentId) 
                            : getActivityTypeColor(activity.type)
                        )}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <div className="text-sm font-medium leading-none flex items-center gap-1">
                            {activity.agent}
                            {getActivityTypeIcon(activity.type)}
                            {activity.priority === "high" && (
                              <Badge variant="destructive" className="ml-1 text-[10px] py-0 px-1 h-4">
                                High Priority
                              </Badge>
                            )}
                            {activity.read && (
                              <span className="text-xs text-muted-foreground ml-1 flex items-center">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Read
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => activity.read ? markAsUnread(activity.id) : markAsRead(activity.id)}>
                                  {activity.read ? (
                                    <>
                                      <EyeOff className="h-4 w-4 mr-2" /> Mark as unread
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-4 w-4 mr-2" /> Mark as read
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => viewActivityDetails(activity)}>
                                  <Eye className="h-4 w-4 mr-2" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => dismissActivity(activity.id)}>
                                  <X className="h-4 w-4 mr-2" /> Dismiss
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="text-sm text-foreground">
                          {activity.content}
                        </div>
                        {activity.status && (
                          <Badge className={cn("mt-1 text-xs font-normal", getStatusBadgeColor(activity.status))}>
                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => activity.read ? markAsUnread(activity.id) : markAsRead(activity.id)}>
                      {activity.read ? 'Mark as unread' : 'Mark as read'}
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => viewActivityDetails(activity)}>
                      View Details
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => dismissActivity(activity.id)}>
                      Dismiss
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
              <div ref={activitiesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>

      <ActivityDetailsDialog
        activity={selectedActivity}
        open={detailsDialogOpen}
        onOpenChange={handleDialogOpenChange}
      />
    </div>
  );
};
