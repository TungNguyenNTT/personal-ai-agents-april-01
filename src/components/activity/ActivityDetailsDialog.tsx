import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Clock, Info, MessageSquare, X } from "lucide-react";
import { Activity, ActivityType } from "./ActivityFeed";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface ActivityDetailsDialogProps {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ActivityDetailsDialog = ({ activity, open, onOpenChange }: ActivityDetailsDialogProps) => {
  if (!activity) return null;

  const getActivityTypeIcon = (type: ActivityType) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-5 w-5" />;
      case "task":
        return <Clock className="h-5 w-5" />;
      case "alert":
        return <AlertCircle className="h-5 w-5" />;
      case "update":
        return <Info className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
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

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case "high":
        return "High Priority";
      case "medium":
        return "Medium Priority";
      case "low":
        return "Low Priority";
      case "urgent":
        return "Urgent Priority";
      default:
        return "Normal Priority";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "urgent":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatFullDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className={cn("h-4 w-4 rounded-full", getActivityTypeColor(activity.type))} />
            <AlertDialogTitle className="flex items-center gap-2">
              {activity.agent} 
              {getActivityTypeIcon(activity.type)}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} from {activity.agent}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <div className="text-foreground">{activity.content}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Status</h4>
              <div className="flex items-center">
                <Badge className={cn("text-xs", getStatusBadgeColor(activity.status))}>
                  {activity.status ? (activity.status.charAt(0).toUpperCase() + activity.status.slice(1)) : "Unspecified"}
                </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Priority</h4>
              <div className="flex items-center">
                <Badge className={cn("text-xs", getPriorityColor(activity.priority))}>
                  {getPriorityLabel(activity.priority)}
                </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Time</h4>
              <div className="text-xs text-muted-foreground">{formatFullDate(activity.timestamp)}</div>
              <div className="text-xs text-muted-foreground">({formatRelativeTime(activity.timestamp)})</div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Agent ID</h4>
              <div className="text-xs text-muted-foreground">{activity.agentId}</div>
            </div>
          </div>
        </div>
        
        <AlertDialogFooter className="sm:justify-end">
          <AlertDialogCancel asChild>
            <Button 
              type="button" 
              variant="secondary"
              onClick={handleClose}
              className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 font-medium"
            >
              Close
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
