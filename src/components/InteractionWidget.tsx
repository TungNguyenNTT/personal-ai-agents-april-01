import React, { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  X, 
  Maximize2, 
  Minimize2, 
  Mic, 
  MicOff, 
  Router, 
  Paperclip, 
  ArrowRight,
  File as FileIcon,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useActivity } from "@/contexts/ActivityContext";
import { 
  getAgentAvatarClasses, 
  getAgentBubbleClasses, 
  getAgentIdFromName 
} from "@/components/activity/activityUtils";
import { FileUpload, FileInfo } from "@/components/FileUpload";

interface SuggestionChip {
  id: string;
  text: string;
  action?: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

interface Message {
  id: string;
  content: string;
  detailedContent?: string;
  sender: "user" | "agent" | "coordinator";
  timestamp: Date;
  agentName?: string;
  agentIcon?: React.ElementType;
  routedFrom?: string;
  agentId?: string;
  suggestionChips?: SuggestionChip[];
  attachments?: Attachment[];
}

export const InteractionWidget = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I assist you today?",
      detailedContent: "Welcome to the AI Assistant Hub. I'm here to help you with any tasks or questions you might have. I can route your requests to specialized agents for calendar management, home automation, email handling, and more.",
      sender: "agent",
      timestamp: new Date(),
      agentName: "Home Assistant",
      agentId: "home-assistant",
      suggestionChips: [
        { id: "s1", text: "Check my schedule" },
        { id: "s2", text: "Turn on living room lights" },
        { id: "s3", text: "Check email inbox" }
      ]
    },
    {
      id: "2",
      content: "I need help with my schedule for today.",
      sender: "user",
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: "3",
      content: "I've checked your calendar. You have a meeting at 2 PM with the marketing team and a call at 4 PM with clients.",
      detailedContent: "I've checked your calendar for today, July 15, 2023. You have the following appointments:\n\n1. Marketing Team Weekly Sync at 2:00 PM - 3:00 PM (Conference Room B)\n2. Client Call with Acme Corp at 4:00 PM - 4:45 PM (Zoom Meeting ID: 123-456-789)\n\nYou have a 1-hour gap between these meetings. Would you like me to suggest ways to use this time effectively?",
      sender: "agent",
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
      agentName: "Calendar Assistant",
      agentId: "calendar",
      suggestionChips: [
        { id: "s4", text: "Schedule a new meeting" },
        { id: "s5", text: "Show tomorrow's schedule" },
        { id: "s6", text: "Find free time this week" }
      ]
    }
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<FileInfo[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activities, addActivity } = useActivity();
  const [processedActivityIds, setProcessedActivityIds] = useState<string[]>([]);
  const [lastSentMessage, setLastSentMessage] = useState<string>("");
  const [lastSentTimestamp, setLastSentTimestamp] = useState<number>(0);
  
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const messageActivities = activities
      .filter(activity => activity.type === "message" && !activity.dismissed && !processedActivityIds.includes(activity.id))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    if (messageActivities.length > 0) {
      const newProcessedIds = [...processedActivityIds];
      const newMessages: Message[] = [];
      
      messageActivities.forEach(activity => {
        if (!activity.content.startsWith("You:") && activity.agentId !== "user") {
          const message: Message = {
            id: activity.id,
            content: activity.content,
            detailedContent: activity.detailedContent || activity.content,
            sender: activity.agentId === "user" ? "user" : "agent",
            timestamp: activity.timestamp,
            agentName: activity.agent !== "User" ? activity.agent : undefined,
            agentId: activity.agentId,
            suggestionChips: activity.suggestionChips || [],
            attachments: activity.attachments
          };
          
          newMessages.push(message);
        }
        
        newProcessedIds.push(activity.id);
      });
      
      if (newMessages.length > 0) {
        setMessages(prev => [...prev, ...newMessages]);
      }
      
      setProcessedActivityIds(newProcessedIds);
    }
  }, [activities, processedActivityIds]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    
    const now = Date.now();
    if (newMessage.trim() === lastSentMessage && now - lastSentTimestamp < 2000) {
      setNewMessage("");
      return;
    }
    
    setLastSentMessage(newMessage);
    setLastSentTimestamp(now);
    
    const hasAttachments = attachments.length > 0;
    const attachmentSummary = hasAttachments 
      ? `${attachments.length} file${attachments.length > 1 ? 's' : ''} attached` 
      : '';
    
    const messageContent = newMessage.trim() 
      ? (hasAttachments ? `${newMessage} (${attachmentSummary})` : newMessage)
      : attachmentSummary;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: "user",
      timestamp: new Date(),
      attachments: hasAttachments ? attachments.map(att => ({
        id: att.id,
        name: att.name,
        type: att.type,
        url: att.url,
        size: att.size
      })) : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setAttachments([]);
    
    addActivity({
      type: "message",
      agent: "User",
      agentId: "user",
      content: `You: ${messageContent}`,
      status: "completed",
      attachments: hasAttachments ? attachments.map(att => ({
        id: att.id,
        name: att.name,
        type: att.type,
        url: att.url,
        size: att.size
      })) : undefined
    });
    
    setTimeout(() => {
      const coordinatorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm routing your request to the appropriate agent...",
        detailedContent: `I'm analyzing your request: "${newMessage}"\n\nBased on the content, I'll route this to the most appropriate specialized agent to handle your inquiry.`,
        sender: "coordinator",
        timestamp: new Date(),
        agentName: "Coordinator Agent",
        agentId: "coordinator"
      };
      
      setMessages(prev => [...prev, coordinatorResponse]);
      
      addActivity({
        type: "message",
        agent: "Coordinator Agent",
        agentId: "coordinator",
        content: coordinatorResponse.content,
        status: "completed"
      });
      
      setTimeout(() => {
        let respondingAgent = determineAgent(newMessage);
        let respondingAgentId = respondingAgent.toLowerCase().replace(/\s/g, '-');
        
        const agentResponse: Message = {
          id: (Date.now() + 2).toString(),
          content: `I'm processing your request: "${newMessage}"`,
          detailedContent: `I'm now processing your request: "${newMessage}"${hasAttachments ? ` with ${attachmentSummary}` : ''}\n\nThis may take a moment while I analyze the context and prepare a comprehensive response. I'll have my answer for you shortly.`,
          sender: "agent",
          timestamp: new Date(),
          agentName: respondingAgent,
          agentId: respondingAgentId,
          routedFrom: "Coordinator Agent"
        };
        
        addActivity({
          type: "message",
          agent: respondingAgent,
          agentId: respondingAgentId,
          content: agentResponse.content,
          status: "in-progress"
        });
        
        setMessages(prev => [...prev, agentResponse]);
        
        setTimeout(() => {
          const [shortResponse, detailedResponse, suggestionChips] = generateResponses(newMessage, respondingAgent, hasAttachments);
          const finalResponse: Message = {
            id: (Date.now() + 3).toString(),
            content: shortResponse,
            detailedContent: detailedResponse,
            sender: "agent",
            timestamp: new Date(),
            agentName: respondingAgent,
            agentId: respondingAgentId,
            suggestionChips: suggestionChips
          };
          
          addActivity({
            type: "message",
            agent: respondingAgent,
            agentId: respondingAgentId,
            content: shortResponse,
            detailedContent: detailedResponse,
            suggestionChips: suggestionChips,
            status: "completed"
          });
          
          setMessages(prev => [...prev, finalResponse]);
        }, 2000);
      }, 1500);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: SuggestionChip) => {
    if (suggestion.action) {
      console.log("Executing suggestion action:", suggestion.action);
      toast({
        title: "Executing action",
        description: `Performing: ${suggestion.text}`,
      });
    } else {
      setNewMessage(suggestion.text);
      
      setTimeout(() => {
        const userMessage: Message = {
          id: Date.now().toString(),
          content: suggestion.text,
          sender: "user",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        
        addActivity({
          type: "message",
          agent: "User",
          agentId: "user",
          content: `You: ${suggestion.text}`,
          status: "completed"
        });
        
        setNewMessage("");
        setAttachments([]);
        
        setTimeout(() => {
          const coordinatorResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: "I'm routing your request to the appropriate agent...",
            detailedContent: `I'm analyzing your request: "${suggestion.text}"\n\nBased on the content, I'll route this to the most appropriate specialized agent to handle your inquiry.`,
            sender: "coordinator",
            timestamp: new Date(),
            agentName: "Coordinator Agent",
            agentId: "coordinator"
          };
          
          setMessages(prev => [...prev, coordinatorResponse]);
          
          addActivity({
            type: "message",
            agent: "Coordinator Agent",
            agentId: "coordinator",
            content: coordinatorResponse.content,
            status: "completed"
          });
          
          setTimeout(() => {
            let respondingAgent = determineAgent(suggestion.text);
            let respondingAgentId = respondingAgent.toLowerCase().replace(/\s/g, '-');
            
            const agentResponse: Message = {
              id: (Date.now() + 2).toString(),
              content: `I'm processing your request: "${suggestion.text}"`,
              detailedContent: `I'm now processing your request: "${suggestion.text}"\n\nThis may take a moment while I analyze the context and prepare a comprehensive response. I'll have my answer for you shortly.`,
              sender: "agent",
              timestamp: new Date(),
              agentName: respondingAgent,
              agentId: respondingAgentId,
              routedFrom: "Coordinator Agent"
            };
            
            addActivity({
              type: "message",
              agent: respondingAgent,
              agentId: respondingAgentId,
              content: agentResponse.content,
              status: "in-progress"
            });
            
            setMessages(prev => [...prev, agentResponse]);
            
            setTimeout(() => {
              const [shortResponse, detailedResponse, suggestionChips] = generateResponses(suggestion.text, respondingAgent, false);
              const finalResponse: Message = {
                id: (Date.now() + 3).toString(),
                content: shortResponse,
                detailedContent: detailedResponse,
                sender: "agent",
                timestamp: new Date(),
                agentName: respondingAgent,
                agentId: respondingAgentId,
                suggestionChips: suggestionChips
              };
              
              addActivity({
                type: "message",
                agent: respondingAgent,
                agentId: respondingAgentId,
                content: shortResponse,
                detailedContent: detailedResponse,
                suggestionChips: suggestionChips,
                status: "completed"
              });
              
              setMessages(prev => [...prev, finalResponse]);
            }, 2000);
          }, 1500);
        }, 1000);
      }, 100);
    }
  };

  const determineAgent = (message: string): string => {
    const msgLower = message.toLowerCase();
    
    if (msgLower.includes("schedule") || msgLower.includes("meeting") || msgLower.includes("calendar")) {
      return "Calendar Assistant";
    } else if (msgLower.includes("email") || msgLower.includes("message") || msgLower.includes("send")) {
      return "Email Assistant";
    } else if (msgLower.includes("home") || msgLower.includes("light") || msgLower.includes("temperature")) {
      return "Home Assistant";
    } else {
      return "Chat GPT";
    }
  };

  const generateResponses = (message: string, agent: string, hasAttachments: boolean): [string, string, SuggestionChip[]] => {
    const msgLower = message.toLowerCase();
    const attachmentText = hasAttachments ? " I've also received your attachments and will process them accordingly." : "";
    
    if (agent === "Calendar Assistant") {
      if (msgLower.includes("schedule") || msgLower.includes("add")) {
        const shortResponse = "I've scheduled your requested meeting." + attachmentText;
        const detailedResponse = "I've scheduled your requested meeting. You can view the details in your calendar app. The meeting has been set for tomorrow at 10:00 AM with a duration of 60 minutes. I've added your requested participants (John, Sarah, and Mike) and included the agenda you specified." + attachmentText + " Would you like me to send invitations to the participants now?";
        const suggestionChips: SuggestionChip[] = [
          { id: crypto.randomUUID(), text: "Send invitations" },
          { id: crypto.randomUUID(), text: "Edit meeting details" },
          { id: crypto.randomUUID(), text: "Show my schedule" }
        ];
        return [shortResponse, detailedResponse, suggestionChips];
      } else if (msgLower.includes("today")) {
        const shortResponse = "Today you have 3 meetings scheduled." + attachmentText;
        const detailedResponse = "Today you have 3 meetings:\n\n1. Team standup at 9:30 AM (30 min) - Conference Room A\n2. Project review at 2:00 PM (1 hour) - Zoom call\n3. Client call at 4:00 PM (45 min) - Phone call\n\n" + attachmentText + " Would you like me to prepare any materials or set reminders for these meetings?";
        const suggestionChips: SuggestionChip[] = [
          { id: crypto.randomUUID(), text: "Set reminders" },
          { id: crypto.randomUUID(), text: "Prepare materials" },
          { id: crypto.randomUUID(), text: "Show tomorrow's meetings" }
        ];
        return [shortResponse, detailedResponse, suggestionChips];
      } else {
        const shortResponse = "I've analyzed your calendar for the coming week." + attachmentText;
        const detailedResponse = "I've analyzed your calendar. Next week seems quite busy with 12 meetings scheduled, primarily focused on the product launch. There are several conflicts I've identified on Wednesday afternoon." + attachmentText + " Would you like me to suggest some time blocks for focused work? I also notice you haven't scheduled any breaks on Thursday - should I add some buffer time between your back-to-back meetings?";
        const suggestionChips: SuggestionChip[] = [
          { id: crypto.randomUUID(), text: "Suggest focused work blocks" },
          { id: crypto.randomUUID(), text: "Add buffer time" },
          { id: crypto.randomUUID(), text: "Fix conflicts" }
        ];
        return [shortResponse, detailedResponse, suggestionChips];
      }
    } else if (agent === "Email Assistant") {
      if (msgLower.includes("send")) {
        const shortResponse = "I've drafted the email based on your request." + attachmentText;
        const detailedResponse = "I've drafted the email based on your request to follow up with the marketing team about the campaign results. The email includes the performance metrics you mentioned, along with the suggested improvements for the next campaign phase." + (hasAttachments ? " I've attached the files you provided to the draft." : "") + " I've addressed it to the entire marketing team and copied the department head. Would you like to review the draft before I send it, or would you like me to make any specific adjustments to the content?";
        const suggestionChips: SuggestionChip[] = [
          { id: crypto.randomUUID(), text: "Review draft" },
          { id: crypto.randomUUID(), text: "Send now" },
          { id: crypto.randomUUID(), text: "Edit recipients" }
        ];
        return [shortResponse, detailedResponse, suggestionChips];
      } else if (msgLower.includes("check") || msgLower.includes("inbox")) {
        const shortResponse = "You have 5 unread emails, 1 marked as urgent." + attachmentText;
        const detailedResponse = "You have 5 unread emails in your inbox:\n\n1. [URGENT] Project deadline update from your manager (received 20 min ago)\n2. Meeting notes from yesterday's client presentation (received 2 hours ago)\n3. HR announcement about the company holiday party (received yesterday)\n4. Weekly newsletter subscription (received yesterday)\n5. Software update notification for your design tools (received 2 days ago)\n\n" + attachmentText + " Would you like me to summarize the urgent email from your manager or help you respond to any of these messages?";
        const suggestionChips: SuggestionChip[] = [
          { id: crypto.randomUUID(), text: "Summarize urgent email" },
          { id: crypto.randomUUID(), text: "Draft response to manager" },
          { id: crypto.randomUUID(), text: "Archive newsletters" }
        ];
        return [shortResponse, detailedResponse, suggestionChips];
      } else {
        const shortResponse = "I can help manage your emails and draft responses." + attachmentText;
        const detailedResponse = "I can help you manage your emails in several ways:\n\n1. Categorize your inbox into priority levels\n2. Draft responses to common inquiries\n3. Set up filters for better organization\n4. Create templates for frequent communication types\n5. Schedule follow-up reminders\n\n" + attachmentText + " Your inbox currently has 43 emails that need attention, with about 15 that appear to require responses. Would you like me to start by helping you address the most time-sensitive messages first?";
        const suggestionChips: SuggestionChip[] = [
          { id: crypto.randomUUID(), text: "Address time-sensitive emails" },
          { id: crypto.randomUUID(), text: "Set up filters" },
          { id: crypto.randomUUID(), text: "Create response templates" }
        ];
        return [shortResponse, detailedResponse, suggestionChips];
      }
    } else if (agent === "Home Assistant") {
      if (msgLower.includes("light")) {
        const shortResponse = "I've adjusted the lights as requested." + attachmentText;
        const detailedResponse = "I've adjusted the lights as requested. The living room lights are now set to 70% brightness with a warm tone (2700K). I've also created a new scene called 'Evening Reading' with these settings that you can activate with a voice command in the future." + attachmentText + " Would you like me to apply similar settings to other rooms or schedule these lights to automatically adjust at certain times?";
        const suggestionChips: SuggestionChip[] = [
          { id: crypto.randomUUID(), text: "Apply to other rooms" },
          { id: crypto.randomUUID(), text: "Schedule light changes" },
          { id: crypto.randomUUID(), text: "Create more scenes" }
        ];
        return [shortResponse, detailedResponse, suggestionChips];
      } else if (msgLower.includes("temperature")) {
        const shortResponse = "Home temperature adjusted to your preferred setting." + attachmentText;
        const detailedResponse = "The current home temperature is 72°F. I've adjusted the thermostat to your preferred 70°F for the evening. Based on the weather forecast, I've also optimized the HVAC schedule for energy efficiency overnight." + attachmentText + " The system will maintain this temperature until your morning routine begins at 6:30 AM, when it will gradually warm to 72°F. Your estimated energy savings from this optimization is approximately 8% compared to a constant temperature.";
        const suggestionChips: SuggestionChip[] = [
          { id: crypto.randomUUID(), text: "Show temperature history" },
          { id: crypto.randomUUID(), text: "Adjust morning settings" },
          { id: crypto.randomUUID(), text: "View energy savings" }
        ];
        return [shortResponse, detailedResponse, suggestionChips];
      } else {
        const shortResponse = "All home systems are functioning normally." + attachmentText;
        const detailedResponse = "All systems in your home are functioning normally:\n\n- Security: Armed (perimeter only)\n- Doors: All locked\n- Windows: All secured\n- Temperature: 70°F\n- Lighting: Night mode active\n- Cameras: Motion detection enabled\n- Water leak sensors: No alerts\n- Air quality: Good (AQI 42)\n\n" + attachmentText + " There are no pending maintenance tasks for any connected devices. Would you like me to perform a more detailed diagnostic on any specific system?";
        const suggestionChips: SuggestionChip[] = [
          { id: crypto.randomUUID(), text: "Security system details" },
          { id: crypto.randomUUID(), text: "Camera feeds" },
          { id: crypto.randomUUID(), text: "Change lighting mode" }
        ];
        return [shortResponse, detailedResponse, suggestionChips];
      }
    } else {
      const shortResponse = "I've researched your question and found relevant information." + attachmentText;
      const detailedResponse = "I've researched your question extensively and found several relevant sources of information. Based on the latest data and expert opinions, I've compiled a comprehensive analysis that addresses the key aspects of your inquiry." + attachmentText + "\n\nThe most effective approach appears to be the one outlined in the recent study by Johnson et al. (2023), which demonstrated a 37% improvement in outcomes using their methodology. This aligns well with your specific situation because it accounts for the variables you mentioned.\n\n" + (hasAttachments ? "I've also analyzed the documents you sent and integrated their information into my response. " : "") + "I can provide more detailed implementation steps, recommend specific resources, or explore alternative approaches if this doesn't fully address your needs. Would you like me to elaborate on any particular aspect?";
      const suggestionChips: SuggestionChip[] = [
        { id: crypto.randomUUID(), text: "Show implementation steps" },
        { id: crypto.randomUUID(), text: "Recommend resources" },
        { id: crypto.randomUUID(), text: "Explore alternatives" }
      ];
      return [shortResponse, detailedResponse, suggestionChips];
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      toast({
        title: "Voice recording stopped",
        description: "Processing your command...",
      });
      
      setTimeout(() => {
        const fakeCommand = "Schedule a meeting for tomorrow at 10am";
        setNewMessage(fakeCommand);
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

  if (!isOpen) return null;

  const getMessageContent = (message: Message) => {
    return message.detailedContent || message.content;
  };

  const getMessageWithAgentId = (message: Message): Message => {
    if (message.sender !== "agent" && message.sender !== "coordinator") return message;
    if (message.agentId) return message;
    
    return {
      ...message,
      agentId: getAgentIdFromName(message.agentName)
    };
  };

  const renderAttachments = (attachments?: Attachment[]) => {
    if (!attachments || attachments.length === 0) return null;
    
    return (
      <div className="mt-2 space-y-1">
        <div className="text-xs font-medium mb-1">Attachments:</div>
        {attachments.map((att) => (
          <div key={att.id} className="flex items-center gap-2 bg-background/50 p-1.5 rounded text-xs">
            {att.type.startsWith("image/") ? (
              <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                <FileImage className="h-3 w-3" />
              </div>
            ) : att.type.startsWith("video/") ? (
              <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                <FileVideo className="h-3 w-3" />
              </div>
            ) : att.type.startsWith("audio/") ? (
              <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                <FileAudio className="h-3 w-3" />
              </div>
            ) : att.type.includes("zip") || att.type.includes("rar") ? (
              <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                <FileArchive className="h-3 w-3" />
              </div>
            ) : (
              <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                <FileIcon className="h-3 w-3" />
              </div>
            )}
            <span className="truncate">{att.name}</span>
          </div>
        ))}
      </div>
    );
  };

  if (isMobile) {
    return (
      <Card className="fixed inset-x-0 bottom-0 z-50 flex flex-col border border-border shadow-lg max-h-[90vh]">
        <CardHeader className="p-3 flex flex-row items-center space-y-0 gap-2">
          <CardTitle className="text-sm font-medium">Agent Interactions</CardTitle>
          <div className="flex ml-auto gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full" 
              onClick={onClose}
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 overflow-y-auto flex-1 flex flex-col gap-3">
          {messages.map((message) => {
            const messageWithId = getMessageWithAgentId(message);
            const agentId = messageWithId.agentId || "chat-gpt";
            
            return (
              <div key={messageWithId.id} className="flex flex-col">
                <div 
                  className={cn(
                    "flex gap-2 max-w-[90%]", 
                    messageWithId.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <Avatar className={cn(
                    "h-8 w-8 flex-shrink-0",
                    messageWithId.sender === "coordinator" && getAgentAvatarClasses("coordinator"),
                    messageWithId.sender === "agent" && getAgentAvatarClasses(agentId)
                  )}>
                    {messageWithId.sender === "user" ? (
                      <>
                        <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                      </>
                    ) : messageWithId.sender === "coordinator" ? (
                      <>
                        <AvatarImage src="" alt="Coordinator" />
                        <AvatarFallback className={getAgentAvatarClasses("coordinator")}>
                          <Router className="h-4 w-4" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src="" alt={messageWithId.agentName} />
                        <AvatarFallback>{messageWithId.agentName?.[0] || 'A'}</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div className={cn(
                    "rounded-lg p-2 text-sm",
                    messageWithId.sender === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : messageWithId.sender === "coordinator"
                      ? getAgentBubbleClasses("coordinator")
                      : getAgentBubbleClasses(agentId)
                  )}>
                    {messageWithId.agentName && (
                      <div className="text-xs font-medium mb-1 flex items-center gap-1">
                        {messageWithId.agentName}
                        {messageWithId.routedFrom && (
                          <span className="text-[10px] opacity-70 flex items-center gap-0.5">
                            (via <Router className="h-2.5 w-2.5" /> {messageWithId.routedFrom})
                          </span>
                        )}
                      </div>
                    )}
                    <div className="whitespace-pre-line">{getMessageContent(messageWithId)}</div>
                    {renderAttachments(messageWithId.attachments)}
                    <div className="text-xs opacity-70 mt-1">
                      {messageWithId.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                
                {messageWithId.suggestionChips && messageWithId.suggestionChips.length > 0 && (
                  <div className={cn(
                    "flex flex-wrap gap-2 mt-2",
                    messageWithId.sender === "user" ? "justify-end" : "justify-start",
                    messageWithId.sender === "user" ? "ml-auto" : "ml-10 mr-auto"
                  )}>
                    {messageWithId.suggestionChips.map((suggestion) => (
                      <Button
                        key={suggestion.id}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "py-1 px-3 rounded-full text-xs flex items-center gap-1", 
                          messageWithId.sender === "coordinator" 
                            ? "border-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-800 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-400" 
                            : `border-${agentId}-300 bg-${agentId}-50 hover:bg-${agentId}-100 dark:bg-${agentId}-950 dark:border-${agentId}-800 dark:hover:bg-${agentId}-900`
                        )}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion.text}
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="p-3 border-t">
          <form 
            className="flex flex-col gap-2" 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <Textarea 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="min-h-9 max-h-32 flex-1"
            />
            
            {attachments.length > 0 && (
              <div className="space-y-2">
                {/* Attachments are shown inside the FileUpload component */}
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
                className="h-9 w-9 flex-shrink-0"
                variant={isRecording ? "destructive" : "outline"}
                onClick={toggleRecording}
                title={isRecording ? "Stop recording" : "Start voice recording"}
              >
                {isRecording ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button 
                size="icon" 
                className="h-9 w-9 flex-shrink-0"
                disabled={!newMessage.trim() && attachments.length === 0}
                type="submit"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-16 right-4 z-50 flex flex-col shadow-lg border border-border transition-all duration-300",
      expanded ? "w-[calc(50%-1.5rem)] h-[80vh]" : "w-96 h-[450px]"
    )}>
      <CardHeader className="p-3 flex flex-row items-center space-y-0 gap-2">
        <CardTitle className="text-sm font-medium">Agent Interactions</CardTitle>
        <div className="flex ml-auto gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-full" 
            onClick={toggleExpanded}
            title={expanded ? "Minimize" : "Maximize"}
          >
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-full" 
            onClick={onClose}
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 flex-1 overflow-y-auto flex flex-col gap-3">
        {messages.map((message) => {
          const messageWithId = getMessageWithAgentId(message);
          const agentId = messageWithId.agentId || "chat-gpt";
          
          return (
            <div key={messageWithId.id} className="flex flex-col">
              <div 
                className={cn(
                  "flex gap-2 max-w-[90%]", 
                  messageWithId.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <Avatar className={cn(
                  "h-8 w-8 flex-shrink-0",
                  messageWithId.sender === "coordinator" && getAgentAvatarClasses("coordinator"),
                  messageWithId.sender === "agent" && getAgentAvatarClasses(agentId)
                )}>
                  {messageWithId.sender === "user" ? (
                    <>
                      <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                      <AvatarFallback>U</AvatarFallback>
                    </>
                  ) : messageWithId.sender === "coordinator" ? (
                    <>
                      <AvatarImage src="" alt="Coordinator" />
                      <AvatarFallback className={getAgentAvatarClasses("coordinator")}>
                        <Router className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="" alt={messageWithId.agentName} />
                      <AvatarFallback>{messageWithId.agentName?.[0] || 'A'}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div className={cn(
                  "rounded-lg p-2 text-sm",
                  messageWithId.sender === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : messageWithId.sender === "coordinator"
                    ? getAgentBubbleClasses("coordinator")
                    : getAgentBubbleClasses(agentId)
                )}>
                  {messageWithId.agentName && (
                    <div className="text-xs font-medium mb-1 flex items-center gap-1">
                      {messageWithId.agentName}
                      {messageWithId.routedFrom && (
                        <span className="text-[10px] opacity-70 flex items-center gap-0.5">
                          (via <Router className="h-2.5 w-2.5" /> {messageWithId.routedFrom})
                        </span>
                      )}
                    </div>
                  )}
                  <div className="whitespace-pre-line">{getMessageContent(messageWithId)}</div>
                  {renderAttachments(messageWithId.attachments)}
                  <div className="text-xs opacity-70 mt-1">
                    {messageWithId.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              
              {messageWithId.suggestionChips && messageWithId.suggestionChips.length > 0 && (
                <div className={cn(
                  "flex flex-wrap gap-2 mt-2",
                  messageWithId.sender === "user" ? "justify-end" : "justify-start",
                  messageWithId.sender === "user" ? "ml-auto" : "ml-10 mr-auto"
                )}>
                  {messageWithId.suggestionChips.map((suggestion) => (
                    <Button
                      key={suggestion.id}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "py-1 px-3 rounded-full text-xs flex items-center gap-1", 
                        messageWithId.sender === "coordinator" 
                          ? "border-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-800 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-400" 
                          : `border-${agentId}-300 bg-${agentId}-50 hover:bg-${agentId}-100 dark:bg-${agentId}-950 dark:border-${agentId}-800 dark:hover:bg-${agentId}-900`
                      )}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.text}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="p-3 border-t">
        <form 
          className="flex flex-col gap-2" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <Textarea 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-9 max-h-32 flex-1"
          />
          
          {attachments.length > 0 && (
            <div className="space-y-2">
              {/* Attachments are shown inside the FileUpload component */}
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
              className="h-9 w-9 flex-shrink-0"
              variant={isRecording ? "destructive" : "outline"}
              onClick={toggleRecording}
              title={isRecording ? "Stop recording" : "Start voice recording"}
            >
              {isRecording ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button 
              size="icon" 
              className="h-9 w-9 flex-shrink-0"
              disabled={!newMessage.trim() && attachments.length === 0}
              type="submit"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};
