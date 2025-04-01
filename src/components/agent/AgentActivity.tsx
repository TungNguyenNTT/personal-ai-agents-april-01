
import React, { useState } from "react";
import { AlertCircle, RefreshCw, Check, Filter, MessageSquare as MessageSquareIcon, Clock as ClockIcon, Info as InfoIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Activity, ActivityType } from "@/components/activity/ActivityFeed";

export const AgentActivity: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [activities, setActivities] = useState<Activity[]>([]);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate loading activities
    setTimeout(() => {
      // Generate random activities
      const types: ActivityType[] = ["message", "task", "alert", "update"];
      const messages = [
        "Processed your request for weather information",
        "Scheduled a reminder for your meeting",
        "Detected unusual activity in your network",
        "Updated your shopping list with new items",
        "Analyzed your recent browsing patterns",
        "Completed the file organization task",
      ];
      
      const newActivities: Activity[] = Array(5).fill(null).map((_, i) => ({
        id: Math.random().toString(36).substring(2, 9),
        type: types[Math.floor(Math.random() * types.length)],
        agent: "Agent",
        agentId: "agent",
        content: messages[Math.floor(Math.random() * messages.length)],
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24)),
        read: Math.random() > 0.5,
        status: Math.random() > 0.7 ? 
          (Math.random() > 0.5 ? "completed" : "pending") : 
          undefined,
      }));
      
      setActivities(newActivities);
      setLoading(false);
    }, 1500);
  };

  const getActivityTypeIcon = (type: ActivityType) => {
    switch (type) {
      case "message":
        return <MessageSquareIcon className="h-4 w-4" />;
      case "task":
        return <ClockIcon className="h-4 w-4" />;
      case "alert":
        return <AlertCircle className="h-4 w-4" />;
      case "update":
        return <InfoIcon className="h-4 w-4" />;
      default:
        return <MessageSquareIcon className="h-4 w-4" />;
    }
  };

  const getActivityTypeColor = (type: ActivityType) => {
    switch (type) {
      case "message":
        return "bg-blue-500";
      case "task":
        return "bg-green-500";
      case "alert":
        return "bg-red-500";
      case "update":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
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

  const filteredActivities = activities.filter(activity => {
    return filterType === "all" || activity.type === filterType;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <CardTitle>Activity Log</CardTitle>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="message">Messages</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="alert">Alerts</SelectItem>
              <SelectItem value="update">Updates</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>Recent interactions with this agent</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No activity recorded yet</p>
            <p className="text-sm text-muted-foreground">Interactions will appear here when you start using this agent</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={cn(
                    "flex items-start gap-3 rounded-md p-3 transition-colors border",
                    activity.read ? "bg-background border-border/50 opacity-75" : "bg-muted/30 border-border"
                  )}
                >
                  <div
                    className={cn(
                      "mt-1 h-2 w-2 flex-shrink-0 rounded-full",
                      getActivityTypeColor(activity.type)
                    )}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <p className="text-sm font-medium leading-none flex items-center gap-1">
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        {getActivityTypeIcon(activity.type)}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">
                      {activity.content}
                    </p>
                    {activity.status && (
                      <Badge className={cn(
                        "mt-1 text-xs font-normal",
                        activity.status === "completed" ? "bg-green-100 text-green-800" :
                        activity.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      )}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRefresh}
          disabled={loading}
          className="w-full"
          variant="outline"
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Activities
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
