import React, { useState, KeyboardEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, Sparkles, Router, Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useToast } from "@/components/ui/use-toast";
import { useActivity } from "@/contexts/ActivityContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload, FileInfo } from "@/components/FileUpload";
import { config } from "@/config/environment";

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "active" | "idle" | "error";
}

interface CoordinatorAgentProps {
  agents: Agent[];
}

export function CoordinatorAgent({ agents }: CoordinatorAgentProps) {
  const [command, setCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<FileInfo[]>([]);
  const [routingResult, setRoutingResult] = useState<{
    agent: Agent | null;
    confidence: number;
    message: string;
  } | null>(null);
  const { toast: useToastHook } = useToast();
  const { addActivity, updateActivity } = useActivity();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() && attachments.length === 0) return;
    
    setIsProcessing(true);
    setRoutingResult(null);
    
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

      const N8N_ROUTING_URL = config.n8nWebhooks.routing;
      
      if (N8N_ROUTING_URL && N8N_ROUTING_URL.startsWith('http')) {
        try {
          const response = await fetch(N8N_ROUTING_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              activityId,
              command: command.trim(),
              hasAttachments,
              attachments: processedAttachments,
              availableAgents: agents.map(a => ({ id: a.id, name: a.name })),
              user: user ? {
                id: user.id,
                email: user.email
              } : undefined,
              timestamp: new Date().toISOString()
            }),
          });
          
          if (!response.ok) {
            console.error("Failed to route command:", await response.text());
            await updateActivity(activityId, {
              status: "error",
              detailedContent: "Failed to route your request. Please try again."
            });
            
            setRoutingResult({
              agent: null,
              confidence: 0,
              message: "I couldn't route your request due to a backend error."
            });
            
            toast.error("Routing failed", {
              description: "Unable to connect to routing service."
            });
          } else {
            const result = await response.json();
            
            if (result && result.routedAgent) {
              const routedAgentId = result.routedAgent.id;
              const foundAgent = agents.find(a => a.id === routedAgentId);
              
              if (foundAgent) {
                await updateActivity(activityId, {
                  status: "in-progress",
                  detailedContent: `Your request has been routed to ${foundAgent.name}`
                });
                
                setRoutingResult({
                  agent: foundAgent,
                  confidence: result.confidence || 0.7,
                  message: result.message || `I've routed your request to ${foundAgent.name}.`
                });
                
                toast.success(`Command routed to ${foundAgent.name}`, {
                  description: `Confidence: ${Math.round((result.confidence || 0.7) * 100)}%`
                });
              } else {
                setRoutingResult({
                  agent: null,
                  confidence: result.confidence || 0,
                  message: "The selected agent is not available."
                });
                
                await updateActivity(activityId, {
                  status: "error",
                  detailedContent: "The selected agent is not available."
                });
              }
            } else {
              setRoutingResult({
                agent: null,
                confidence: 0,
                message: "No suitable agent was found for your request."
              });
              
              await updateActivity(activityId, {
                status: "failed",
                detailedContent: "No suitable agent was found for your request."
              });
            }
          }
        } catch (error) {
          console.error("Error routing with backend:", error);
          setRoutingResult({
            agent: null,
            confidence: 0,
            message: "An error occurred while routing your request."
          });
          
          await updateActivity(activityId, {
            status: "error",
            detailedContent: "An error occurred while routing your request."
          });
          
          toast.error("Routing failed", {
            description: "An unexpected error occurred."
          });
        }
      } else {
        console.log("No valid N8N routing URL configured, using frontend fallback");
        
        setTimeout(async () => {
          const { agent, confidence } = routeCommand(command);
          
          if (agent) {
            const resultMessage = confidence > 0.7 
              ? `I've routed your request to ${agent.name} with high confidence.`
              : confidence > 0.4
              ? `I think ${agent.name} can help with this, but I'm not entirely sure.`
              : `I'm not sure which agent can help best, but I've sent your request to ${agent.name}.`;
            
            setRoutingResult({
              agent,
              confidence,
              message: resultMessage
            });
            
            await updateActivity(activityId, {
              status: "completed",
              detailedContent: `Routed to ${agent.name} with ${Math.round(confidence * 100)}% confidence`
            });
            
            await addActivity({
              type: "message",
              agent: agent.name,
              agentId: agent.id,
              content: `I've received your request: "${command.substring(0, 30)}${command.length > 30 ? '...' : ''}"${
                hasAttachments ? ` with ${attachmentSummary}` : ''
              }`,
              status: "completed",
            });
            
            toast.success(`Command routed to ${agent.name}`, {
              description: `Confidence: ${Math.round(confidence * 100)}%`
            });
          } else {
            setRoutingResult({
              agent: null,
              confidence: 0,
              message: "I couldn't determine which agent should handle this request."
            });
            
            await updateActivity(activityId, {
              status: "failed",
              detailedContent: "Unable to determine which agent should handle this request."
            });
            
            toast.error("Routing failed", {
              description: "Unable to determine which agent should handle this request."
            });
          }
        }, 1500);
      }
    } catch (error) {
      console.error("Error in submission:", error);
      toast.error("Process failed", {
        description: "An unexpected error occurred."
      });
    } finally {
      setCommand("");
      setAttachments([]);
      setIsProcessing(false);
    }
  };

  const routeCommand = (command: string): { agent: Agent | null; confidence: number } => {
    const commandLower = command.toLowerCase();
    
    const keywords = {
      home: ["home", "light", "temperature", "thermostat", "lock", "door", "window", "device"],
      chat: ["research", "question", "write", "draft", "summarize", "explain", "translate"],
      calendar: ["schedule", "meeting", "appointment", "reminder", "event", "calendar", "time"],
      email: ["email", "message", "send", "inbox", "mail", "compose", "draft", "reply"],
      gmail: ["gmail", "google mail", "inbox", "label", "google", "email"],
      "google-drive": ["drive", "file", "folder", "document", "storage", "upload", "google", "cloud"],
      "google-docs": ["doc", "google doc", "document", "edit", "write", "collaborate", "google"],
      telegram: ["telegram", "tg", "chat", "channel", "telegram bot", "telegram message"],
      facebook: ["facebook", "fb", "messenger", "post", "social", "feed", "dm"],
      zalo: ["zalo", "message", "chat", "vietnamese", "vietnam", "zalo message"],
      ott: ["app", "application", "platform", "message", "ott", "over the top", "messaging"],
    };
    
    let bestMatch: Agent | null = null;
    let highestScore = 0;
    let confidence = 0;
    
    agents.forEach(agent => {
      const agentType = agent.id.split('-')[0] as keyof typeof keywords;
      if (keywords[agentType]) {
        const agentKeywords = keywords[agentType];
        let score = 0;
        
        agentKeywords.forEach(keyword => {
          if (commandLower.includes(keyword)) {
            score += 1;
          }
        });
        
        if (score > highestScore) {
          highestScore = score;
          bestMatch = agent;
          confidence = Math.min(score / 3, 1);
        }
      }
    });
    
    if (confidence < 0.3 && agents.length > 0) {
      const chatAgent = agents.find(agent => agent.id.includes('chat'));
      return { 
        agent: chatAgent || agents[0], 
        confidence: 0.2 
      };
    }
    
    return { agent: bestMatch, confidence };
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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      useToastHook({
        title: "Voice recording stopped",
        description: "Processing your command...",
      });
      
      setTimeout(() => {
        const fakeCommand = "Schedule a meeting for tomorrow at 10am";
        setCommand(fakeCommand);
        useToastHook({
          title: "Voice command detected",
          description: fakeCommand,
        });
      }, 1500);
    } else {
      setIsRecording(true);
      useToastHook({
        title: "Voice recording started",
        description: "Listening for your command...",
      });
    }
  };

  const handleFileSelect = (files: FileInfo[]) => {
    setAttachments(prev => [...prev, ...files]);
    useToastHook({
      title: "Files attached",
      description: `${files.length} file${files.length > 1 ? 's' : ''} attached successfully`,
    });
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachments(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Router className="h-5 w-5 text-primary" />
          <CardTitle>Coordinator Agent</CardTitle>
        </div>
        <CardDescription>I'll route your requests to the most appropriate agent</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What can I help you with today? I'll direct your request to the right agent."
              className="min-h-[120px] resize-none"
            />
          </div>
          
          {attachments.length > 0 && (
            <div className="space-y-2">
              {/* Attachments displayed by FileUpload component */}
            </div>
          )}
          
          <div className="flex gap-2">
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
              className="flex-shrink-0"
              title={isRecording ? "Stop recording" : "Start voice recording"}
            >
              {isRecording ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isProcessing || (!command.trim() && attachments.length === 0)}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </form>
        
        {routingResult && (
          <div className="mt-4 rounded-lg border p-4 animate-in fade-in-50 slide-in-from-bottom-5">
            <div className="mb-2 font-medium">Routing Results:</div>
            <div className="text-sm mb-3">{routingResult.message}</div>
            
            {routingResult.agent && (
              <div className="flex items-center gap-2 bg-secondary p-3 rounded-md">
                {React.createElement(routingResult.agent.icon, { 
                  className: "h-5 w-5",
                  "aria-hidden": true 
                })}
                <div>
                  <div className="font-medium">{routingResult.agent.name}</div>
                  <div className="text-xs text-muted-foreground">{routingResult.agent.description}</div>
                </div>
                <div className="ml-auto">
                  <div className={`rounded-full h-2 w-16 ${
                    routingResult.confidence > 0.7 ? "bg-green-500" :
                    routingResult.confidence > 0.4 ? "bg-yellow-500" : 
                    "bg-red-500"
                  }`}>
                    <div 
                      className="h-full rounded-full bg-primary" 
                      style={{ width: `${routingResult.confidence * 100}%` }}
                    />
                  </div>
                  <div className="text-xs mt-1 text-right">{Math.round(routingResult.confidence * 100)}% confidence</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
