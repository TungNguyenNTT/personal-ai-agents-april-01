
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { AgentCommandForm } from "@/components/activity/AgentCommandForm";
import { useAgents } from "@/contexts/AgentContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useActivity } from "@/contexts/ActivityContext";
import { PageTitle } from "@/components/layout/PageTitle";

const ActivityPage = () => {
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const { agents } = useAgents();
  const isMobile = useIsMobile();
  const activityContext = useActivity();
  
  return (
    <>
      <PageTitle 
        title="Activity Center" 
        subtitle="Monitor and interact with all your AI agents" 
      />
      
      <div className="grid gap-2 grid-cols-1 md:grid-cols-2 p-2 pt-0">
        <div className="md:col-span-1">
          <Card className="h-full shadow-sm -ml-[4px] border-l-0 rounded-l-none">
            <CardHeader className="pb-1">
              <CardTitle>Activities Feed</CardTitle>
              <CardDescription>Real-time activity updates from all your AI agents</CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <ActivityFeed 
                agentFilter={selectedAgent} 
                typeFilter={filterType} 
                agents={agents}
                onAgentFilterChange={setSelectedAgent}
                onTypeFilterChange={setFilterType}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card className="h-full shadow-sm">
            <CardHeader className="pb-1">
              <CardTitle>Issue Commands</CardTitle>
              <CardDescription>Send instructions to your AI agents</CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <AgentCommandForm agents={agents} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ActivityPage;
