
import React, { useState } from "react";
import { 
  MessageSquare, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  ChevronRight, 
  ArrowRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActivity, Activity, SuggestionChip } from "@/contexts/ActivityContext";
import { 
  getAgentAvatarClasses, 
  getAgentBubbleClasses, 
  getAgentChipClasses 
} from "@/components/activity/activityUtils";

export const ActivityFeed = () => {
  const { activities, dismissActivity } = useActivity();
  const [expanded, setExpanded] = useState<string | null>(null);
  
  const getTypeIcon = (type: Activity["type"]) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4" />;
      case "action":
        return <Calendar className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const toggleExpanded = (id: string) => {
    if (expanded === id) {
      setExpanded(null);
    } else {
      setExpanded(id);
    }
  };

  const handleSuggestionClick = (suggestion: SuggestionChip, activity: Activity) => {
    console.log(`Suggestion clicked: ${suggestion.text} from ${activity.agent}`);
    // Here we could add logic to handle the suggestion action
    // For example, we could send a message to the agent
  };

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 h-full">
        <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium">No activities yet</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Activities from your AI agents will appear here
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4 pb-4">
        {activities
          .filter(activity => !activity.dismissed)
          .map(activity => (
            <Card 
              key={activity.id} 
              className="shadow-sm border border-border/60" 
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    getAgentAvatarClasses(activity.agentId)
                  )}>
                    {getTypeIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium truncate">{activity.agent}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(activity.timestamp)}
                      </div>
                    </div>
                    <div className="mt-1">
                      {activity.content}
                    </div>
                    
                    {/* Expanded detailed content */}
                    {activity.detailedContent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-auto p-0 text-xs font-normal text-muted-foreground"
                        onClick={() => toggleExpanded(activity.id)}
                      >
                        <span className="flex items-center">
                          {expanded === activity.id ? "Show less" : "Show more"}
                          <ChevronRight
                            className={cn(
                              "h-3 w-3 transition-transform", 
                              expanded === activity.id && "rotate-90"
                            )}
                          />
                        </span>
                      </Button>
                    )}
                    
                    {expanded === activity.id && activity.detailedContent && (
                      <div className="mt-2 text-sm px-3 py-2 bg-muted/30 rounded border border-border/60">
                        {activity.detailedContent}
                      </div>
                    )}
                    
                    {/* Suggestion chips */}
                    {activity.suggestionChips && activity.suggestionChips.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {activity.suggestionChips.map((suggestion) => (
                          <Button
                            key={suggestion.id}
                            variant="outline"
                            size="sm"
                            className={cn(
                              "py-1 px-3 rounded-full text-xs flex items-center gap-1",
                              getAgentChipClasses(activity.agentId)
                            )}
                            onClick={() => handleSuggestionClick(suggestion, activity)}
                          >
                            {suggestion.text}
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    {activity.status && (
                      <div className="mt-2">
                        <Badge
                          variant={activity.status === "failed" ? "destructive" : "outline"}
                          className="text-xs"
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </ScrollArea>
  );
};
