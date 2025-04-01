import React, { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Bot, Sparkles, Bot as BotIcon, Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Agent } from "@/contexts/AgentContext";
import { useActivity } from "@/contexts/ActivityContext";
import { ActivityType } from "./ActivityFeed";
import { FileUpload, FileInfo } from "@/components/FileUpload";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { config } from "@/config/environment";

interface AgentCommandFormProps {
  agents: Agent[];
}

const commandSchema = z.object({
  agentId: z.string({
    required_error: "Please select an agent",
  }),
  commandType: z.enum(["task", "message", "query"], {
    required_error: "Please select a command type",
  }),
  command: z.string().min(5, {
    message: "Command must be at least 5 characters.",
  }),
});

export const AgentCommandForm = ({ agents }: AgentCommandFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<FileInfo[]>([]);
  const { addActivity, updateActivity } = useActivity();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof commandSchema>>({
    resolver: zodResolver(commandSchema),
    defaultValues: {
      commandType: "message",
      command: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof commandSchema>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let processedAttachments = attachments.length > 0 
        ? await processAttachments(attachments)
        : undefined;

      const selectedAgent = agents.find(agent => agent.id === values.agentId);
      const agentName = selectedAgent ? selectedAgent.name : values.agentId;

      const activityType: ActivityType = 
        values.commandType === "message" ? "message" :
        values.commandType === "task" ? "task" : "query";
      
      const hasAttachments = attachments.length > 0;
      const attachmentSummary = hasAttachments 
        ? `${attachments.length} file${attachments.length > 1 ? 's' : ''} attached` 
        : '';
      
      const messageContent = values.command.trim() 
        ? (hasAttachments ? `${values.command} (${attachmentSummary})` : values.command)
        : attachmentSummary;

      console.log("📝 Creating activity in Supabase:", {
        type: activityType,
        agent: agentName,
        agentId: values.agentId,
        content: messageContent
      });

      const activityId = await addActivity({
        type: activityType,
        agent: agentName,
        agentId: values.agentId,
        content: messageContent,
        status: "pending",
        priority: Math.random() > 0.7 ? "high" : "medium",
        attachments: processedAttachments
      });

      console.log("✅ Activity created with ID:", activityId);
      console.log("🔄 Sending command to n8n...");

      await sendToN8N(activityId, {
        type: activityType,
        agent: agentName,
        agentId: values.agentId,
        command: values.command,
        attachments: processedAttachments,
        user: user ? {
          id: user.id,
          email: user.email
        } : undefined
      });

      toast("Command sent", {
        description: `Your ${values.commandType} has been sent to ${agentName}`,
      });
      
      // For debugging purposes, show what URLs we're trying to use
      console.log("🔍 Environment configuration:", {
        commandWebhook: config.n8nWebhook,
        useMockMode: config.useMockMode
      });
      
      if (config.useMockMode) {
        console.log("⚠️ Using MOCK MODE - no actual n8n requests sent!");
        console.log("💡 To use real backend, configure N8N webhook URLs in .env file");
        
        // Simulated backend response
        setTimeout(async () => {
          try {
            console.log("🤖 Simulating agent response (mock mode)");
            await updateActivity(activityId, {
              status: "completed",
              detailedContent: `Simulated response for: "${values.command}"`,
            });
          } catch (error) {
            console.error("Error updating mock response:", error);
          }
        }, 2000);
      }
      
      form.reset({
        agentId: values.agentId,
        commandType: values.commandType,
        command: "",
      });
      setAttachments([]);
    } catch (error) {
      console.error("Error submitting command:", error);
      toast.error("Failed to send command");
    } finally {
      setIsSubmitting(false);
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

  const sendToN8N = async (activityId: string, data: any) => {
    try {
      console.log("🔄 Preparing to send to n8n webhook:", config.n8nWebhook);
      
      if (config.n8nWebhook && config.n8nWebhook.startsWith('http')) {
        console.log("📤 Sending data to n8n:", {
          activityId,
          agent: data.agent,
          agentId: data.agentId,
          type: data.type,
          command: data.command,
          hasAttachments: !!data.attachments
        });
        
        const response = await fetch(config.n8nWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            activityId,
            ...data,
            timestamp: new Date().toISOString(),
            source: "agent_chat"
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("⚠️ Failed to send command to N8N:", errorText);
          console.error("Status:", response.status, response.statusText);
          toast.error("Failed to connect to agent backend", {
            description: "Check console for details"
          });
          
          // Update activity status to error
          await updateActivity(activityId, {
            status: "error",
            detailedContent: "Failed to process your request. Please try again."
          });
        } else {
          console.log("✅ Successfully sent command to n8n!");
          const responseData = await response.json().catch(() => null);
          if (responseData) {
            console.log("📥 n8n response:", responseData);
            // n8n will handle the status update, no need to update here
          }
        }
      } else {
        console.log("⚠️ N8N webhook URL not configured or invalid:", config.n8nWebhook);
        
        // Mock mode - simulate response
        setTimeout(async () => {
          try {
            await updateActivity(activityId, {
              status: "completed",
              detailedContent: `Simulated response for: "${data.command}"`,
            });
          } catch (error) {
            console.error("Error updating mock response:", error);
          }
        }, 2000);
      }
    } catch (error) {
      console.error("🔴 Error sending to N8N:", error);
      toast.error("Failed to send command");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      
      toast("Listening...", {
        description: "Speak clearly into your microphone",
      });
      
      setTimeout(() => {
        const simulatedText = "This is a simulated voice input message for demonstration purposes.";
        form.setValue("command", simulatedText);
        stopRecording();
      }, 2000);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not access microphone");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    toast("Recording stopped", {
      description: "Voice input processed",
    });
  };

  const handleFileSelect = (files: FileInfo[]) => {
    setAttachments(prev => [...prev, ...files]);
    toast("Files attached", {
      description: `${files.length} file${files.length > 1 ? 's' : ''} attached successfully`,
    });
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachments(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="agentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Agent</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center gap-2">
                        <BotIcon className="h-4 w-4" />
                        {agent.name}
                        <span className={`ml-auto h-2 w-2 rounded-full ${
                          agent.status === 'active' ? 'bg-green-500' :
                          agent.status === 'idle' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="commandType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Command Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select command type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="message">
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Message
                    </div>
                  </SelectItem>
                  <SelectItem value="task">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      Task
                    </div>
                  </SelectItem>
                  <SelectItem value="query">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Query
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="command"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Command</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={form.watch("commandType") === "message" 
                    ? "Type your message here..." 
                    : form.watch("commandType") === "task"
                    ? "What would you like the agent to do?"
                    : "What information would you like to know?"}
                  className="resize-none min-h-[100px]"
                  {...field}
                  onKeyDown={handleKeyDown}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {attachments.length > 0 && (
          <div className="space-y-2">
            <FormLabel>Attachments</FormLabel>
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
            variant={isRecording ? "destructive" : "outline"} 
            size="icon"
            onClick={toggleRecording}
            title={isRecording ? "Stop recording" : "Voice input"}
            className="rounded-full"
            disabled={isSubmitting}
          >
            {isRecording ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
