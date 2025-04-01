
import React from "react";
import { Home, MessageSquare, CalendarClock, Mail, Bot } from "lucide-react";

interface Agent {
  name: string;
  description: string;
  icon: React.ElementType;
  status: "active" | "idle" | "error";
  integrationUrl?: string;
  apiKey?: string;
  integrationNotes?: string;
}

interface AgentDetailsProps {
  agent: Agent;
}

export const AgentDetails: React.FC<AgentDetailsProps> = ({ agent }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Status</h2>
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${
            agent.status === 'active' ? 'bg-green-500' :
            agent.status === 'idle' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}></span>
          <span className="capitalize">{agent.status}</span>
        </div>
      </div>
      
      <div className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Commands</h2>
        <p className="text-muted-foreground">Use the command bar below to interact with this agent.</p>
      </div>

      <div className="rounded-lg border p-6 md:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-muted-foreground">No recent activity for this agent.</p>
      </div>
    </div>
  );
};
