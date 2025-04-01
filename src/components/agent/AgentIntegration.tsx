
import React from "react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

interface Agent {
  name: string;
  description: string;
  icon: React.ElementType;
  status: "active" | "idle" | "error";
  integrationUrl?: string;
  apiKey?: string;
  integrationNotes?: string;
}

interface AgentIntegrationProps {
  agent: Agent;
}

export const AgentIntegration: React.FC<AgentIntegrationProps> = ({ agent }) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Integration Settings</CardTitle>
          <CardDescription>Configure how this agent connects to external services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Integration URL</h3>
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{agent.integrationUrl || "No URL configured"}</span>
            </div>
            <p className="text-xs text-muted-foreground">The endpoint used to connect to this service</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">API Key Status</h3>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${agent.apiKey ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm">{agent.apiKey ? "API Key configured" : "No API Key"}</span>
            </div>
            <p className="text-xs text-muted-foreground">Authentication credentials for this service</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Integration Notes</h3>
            <p className="text-sm p-2 bg-muted rounded-md">
              {agent.integrationNotes || "No additional notes"}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">Edit Integration Settings</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>Reference for using this agent's API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-md font-mono text-sm">
            <p className="mb-2"># Example API Request</p>
            <p className="text-green-500">POST {agent.integrationUrl || "https://api.example.com"}</p>
            <p className="mt-2">Authorization: Bearer {"<YOUR_API_KEY>"}</p>
            <p className="mt-2">Content-Type: application/json</p>
            <p className="mt-4">{`{
  "command": "Your command here",
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  }
}`}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
