import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizontal, Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useActivity } from "@/contexts/ActivityContext";
import { FileUpload, FileInfo } from "@/components/FileUpload";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { config } from "@/config/environment";
import { Agent } from "@/contexts/AgentContext";

interface CoordinatorAgentProps {
  agents: Agent[];
}

export function CoordinatorAgent({ agents }: CoordinatorAgentProps) {
  const [command, setCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<FileInfo[]>([]);
  const { toast } = useToast();
  const { addActivity, updateActivity } = useActivity();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() && attachments.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      let processedAttachments = attachments.length > 0 
        ? await processAttachments(attachments)
        : undefined;

      const hasAttachments = attachments.length > 0;
      const attachmentSummary = hasAttachments 
        ? `${attachments.length} file${attachments.length > 1 ? 's' : ''} attached` 
        : '';
      
      const messageContent = command.trim() 
        ? (hasAttachments ? `${command} (${attachmentSummary})` : command)
        : attachmentSummary;

      const activityId = await addActivity({
        type: "message",
        agent: "Coordinator",
        agentId: "coordinator",
        content: messageContent,
        status: "pending",
        attachments: processedAttachments
      });

      // Send to n8n webhook
      if (config.n8nWebhook && config.n8nWebhook.startsWith('http')) {
        try {
          const response = await fetch(config.n8nWebhook, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              activityId,
              command: command.trim(),
              hasAttachments,
              attachments: processedAttachments,
              user: user ? {
                id: user.id,
                email: user.email
              } : undefined,
              timestamp: new Date().toISOString(),
              source: "coordinator",
              availableAgents: agents.map(agent => ({
                id: agent.id,
                name: agent.name,
                capabilities: agent.capabilities
              }))
            }),
          });
          
          if (!response.ok) {
            console.error("Failed to process command:", await response.text());
            await updateActivity(activityId, {
              status: "error",
              detailedContent: "Failed to process your request. Please try again."
            });
            
            toast({
              title: "Error",
              description: "Failed to process your request",
              variant: "destructive"
            });
          } else {
            const result = await response.json();
            
            await updateActivity(activityId, {
              status: "in-progress",
              detailedContent: result.message || "Your request is being processed"
            });

            console.log("Command sent successfully, waiting for response...");
          }
        } catch (error) {
          console.error("Error processing with backend:", error);
          await updateActivity(activityId, {
            status: "error",
            detailedContent: "An error occurred while processing your request."
          });
          
          toast({
            title: "Error",
            description: "Failed to connect to backend service",
            variant: "destructive"
          });
        }
      } else {
        // Mock mode - simulate response after delay
        setTimeout(async () => {
          try {
            await updateActivity(activityId, {
              status: "completed",
              detailedContent: `Simulated response for: "${command}"`,
            });
          } catch (error) {
            console.error("Error updating mock response:", error);
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting command:", error);
      toast({
        title: "Error",
        description: "Failed to send command",
        variant: "destructive"
      });
    } finally {
      setCommand("");
      setAttachments([]);
      setIsProcessing(false);
    }
  };

  const processAttachments = async (files: FileInfo[]): Promise<typeof files> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    const uploadPromises = files.map(async (file) => {
      if (file.url.startsWith('http')) {
        return file;
      }

      const timestamp = Date.now();
      const filePath = `${user.id}/${timestamp}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(filePath, await fetch(file.url).then(r => r.blob()), {
          contentType: file.type,
          cacheControl: '3600',
        });

      if (error) {
        console.error("Error uploading file:", error);
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(data.path);

      return {
        ...file,
        url: publicUrlData.publicUrl,
      };
    });

    return Promise.all(uploadPromises);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      toast({
        title: "Voice recording stopped",
        description: "Processing your command...",
      });
      
      // Simulate voice command
      setTimeout(() => {
        const fakeCommand = "Schedule a meeting for tomorrow at 10am";
        setCommand(fakeCommand);
        toast({
          title: "Voice command detected",
          description: fakeCommand,
        });
      }, 1500);
    } else {
      setIsRecording(true);
      toast({
        title: "Voice recording started",
        description: "Listening for your command...",
      });
    }
  };

  const handleFileSelect = (files: FileInfo[]) => {
    setAttachments(prev => [...prev, ...files]);
    toast({
      title: "Files attached",
      description: `${files.length} file${files.length > 1 ? 's' : ''} attached successfully`,
    });
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachments(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="How can I help you today?"
            className="flex-1"
            disabled={isProcessing}
          />
          <FileUpload 
            onFileSelect={handleFileSelect}
            selectedFiles={attachments}
            onRemoveFile={handleRemoveFile}
            buttonVariant="outline"
          />
          <Button 
            type="button" 
            size="icon" 
            variant={isRecording ? "destructive" : "outline"}
            onClick={toggleRecording}
            disabled={isProcessing}
          >
            {isRecording ? <MicOff className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button type="submit" className="shrink-0" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <SendHorizontal className="mr-2 h-5 w-5" />
                Send
              </>
            )}
          </Button>
        </div>
        
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {/* Attachments are shown inside the FileUpload component */}
          </div>
        )}
      </form>
    </div>
  );
} 