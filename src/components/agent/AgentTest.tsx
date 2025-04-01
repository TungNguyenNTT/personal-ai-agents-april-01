
import React, { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

interface AgentTestProps {
  agentId?: string;
}

export const AgentTest: React.FC<AgentTestProps> = ({ agentId }) => {
  const [testInput, setTestInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);

  const testAgentAPI = async () => {
    if (!testInput.trim()) {
      toast("Input required", {
        description: "Please enter a test message or command"
      });
      return;
    }
    
    setIsLoading(true);
    setTestResponse(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let response;
      const agentType = agentId?.split('-')[0];
      
      switch (agentType) {
        case 'home':
          response = `Home Assistant would process: "${testInput}" to control your smart home devices`;
          break;
        case 'chat':
          response = `I'm an AI assistant. In response to "${testInput}", I'd say this is a simulated response that would normally come from the actual API.`;
          break;
        case 'calendar':
          response = `Calendar action processed: "${testInput}" - Your schedule has been updated accordingly.`;
          break;
        case 'email':
          response = `Email processed: "${testInput}" - Draft created and ready for review.`;
          break;
        default:
          response = `Command received: "${testInput}" - This is a simulated response.`;
      }
      
      setTestResponse(response);
      toast.success("Test completed successfully");
    } catch (error) {
      toast("API Error", {
        description: "Failed to connect to the agent API"
      });
      console.error("Error testing API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Agent API</CardTitle>
        <CardDescription>Send a test command to verify the agent's functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Command</label>
          <Textarea 
            placeholder="Enter a command to test the agent..." 
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
          />
        </div>
        
        {testResponse && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Response</h3>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm whitespace-pre-wrap">{testResponse}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={testAgentAPI}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>Testing...</>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Test Command
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
