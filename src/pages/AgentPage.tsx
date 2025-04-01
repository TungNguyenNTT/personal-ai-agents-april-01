
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Home, 
  MessageSquare, 
  CalendarClock, 
  Mail, 
  Bot, 
  AlertCircle, 
  Code, 
  Send, 
  Link2, 
  Router,
  FileText,
  Folder,
  MessagesSquare,
  Facebook,
  MessageCircle,
  Smartphone,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CommandBar } from "@/components/CommandBar";
import { AgentDetails } from "@/components/agent/AgentDetails";
import { AgentIntegration } from "@/components/agent/AgentIntegration";
import { AgentTest } from "@/components/agent/AgentTest";
import { AgentActivity } from "@/components/agent/AgentActivity";
import { CoordinatorAgent } from "@/components/agent/CoordinatorAgent";

const AgentPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [showCoordinator, setShowCoordinator] = useState(false);
  const [pageTitleElement, setPageTitleElement] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    // Find the page title container in the header
    const element = document.getElementById('page-title');
    if (element) {
      setPageTitleElement(element);
      
      // Clear any existing content to prevent duplicates
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }

    // Clean up when component unmounts
    return () => {
      const titleElement = document.getElementById('page-title');
      if (titleElement) {
        // Clear the content when component unmounts
        while (titleElement.firstChild) {
          titleElement.removeChild(titleElement.firstChild);
        }
      }
    };
  }, []);
  
  const agentData = {
    "home-assistant": {
      name: "Home Assistant",
      description: "Controls your smart home devices and automation routines",
      icon: Home,
      status: "active" as const,
      integrationUrl: "http://homeassistant.local:8123/api",
      apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      integrationNotes: "Home Assistant long-lived access token required",
    },
    "chat-gpt": {
      name: "Chat GPT",
      description: "AI assistant that helps with research, writing, and creative tasks",
      icon: MessageSquare,
      status: "active" as const,
      integrationUrl: "https://api.openai.com/v1",
      apiKey: "sk-...",
      integrationNotes: "Uses GPT-4o model for responses",
    },
    "calendar": {
      name: "Calendar Assistant",
      description: "Manages your schedule, meetings, and sends reminders",
      icon: CalendarClock,
      status: "idle" as const,
      integrationUrl: "https://www.googleapis.com/calendar/v3",
      apiKey: "AIza...",
      integrationNotes: "Google Calendar API integration with OAuth2",
    },
    "email": {
      name: "Email Assistant",
      description: "Organizes inbox, drafts responses, and filters spam",
      icon: Mail,
      status: "error" as const,
      integrationUrl: "https://api.sendgrid.com/v3",
      apiKey: "SG...",
      integrationNotes: "SendGrid API for email processing",
    },
    "coordinator": {
      name: "Coordinator Agent",
      description: "Routes your requests to the most appropriate agent",
      icon: Router,
      status: "active" as const,
      integrationUrl: "",
      apiKey: "",
      integrationNotes: "Central coordination service for all your agents",
    },
    "gmail": {
      name: "Gmail Agent",
      description: "Manages and organizes your Gmail inbox and communications",
      icon: Mail,
      status: "active" as const,
      integrationUrl: "https://gmail.googleapis.com/gmail/v1",
      apiKey: "AIza...",
      integrationNotes: "Gmail API with OAuth2 authentication",
    },
    "google-drive": {
      name: "Google Drive Agent",
      description: "Manages and organizes your files in Google Drive",
      icon: Folder,
      status: "active" as const,
      integrationUrl: "https://www.googleapis.com/drive/v3",
      apiKey: "AIza...",
      integrationNotes: "Google Drive API with OAuth2 authentication",
    },
    "google-docs": {
      name: "Google Docs Agent",
      description: "Creates and edits documents in Google Docs",
      icon: FileText,
      status: "idle" as const,
      integrationUrl: "https://docs.googleapis.com/v1",
      apiKey: "AIza...",
      integrationNotes: "Google Docs API with OAuth2 authentication",
    },
    "telegram": {
      name: "Telegram Agent",
      description: "Manages your Telegram conversations and notifications",
      icon: MessagesSquare,
      status: "active" as const,
      integrationUrl: "https://api.telegram.org/bot{token}",
      apiKey: "123456:ABC-DEF1234...",
      integrationNotes: "Telegram Bot API token required",
    },
    "facebook": {
      name: "Facebook Agent",
      description: "Manages your Facebook messages and notifications",
      icon: Facebook,
      status: "idle" as const,
      integrationUrl: "https://graph.facebook.com/v19.0",
      apiKey: "EAA...",
      integrationNotes: "Facebook Graph API with OAuth2 authentication",
    },
    "zalo": {
      name: "Zalo Agent",
      description: "Manages your Zalo communications and notifications",
      icon: MessageCircle,
      status: "active" as const,
      integrationUrl: "https://openapi.zalo.me/v2.0",
      apiKey: "zalo_token...",
      integrationNotes: "Zalo Open API with OAuth2 authentication",
    },
    "ott": {
      name: "OTT Assistant",
      description: "Manages various OTT messaging services and applications",
      icon: Smartphone,
      status: "idle" as const,
      integrationUrl: "https://api.ott-service.com/v1",
      apiKey: "ott_api_key...",
      integrationNotes: "Various OTT platform integrations",
    },
    "google-sheets": {
      name: "Google Sheets Agent",
      description: "Manages and analyzes data in Google Sheets spreadsheets",
      icon: FileSpreadsheet,
      status: "active" as const,
      integrationUrl: "https://sheets.googleapis.com/v4",
      apiKey: "AIza...",
      integrationNotes: "Google Sheets API with OAuth2 authentication",
    },
    "whatsapp": {
      name: "WhatsApp Agent",
      description: "Manages your WhatsApp conversations and notifications",
      icon: MessageSquare,
      status: "active" as const,
      integrationUrl: "https://graph.facebook.com/v19.0/whatsapp",
      apiKey: "EAA...",
      integrationNotes: "WhatsApp Business API via Facebook Graph API",
    }
  };

  let agent = agentId ? agentData[agentId as keyof typeof agentData] : null;
  
  const allAgents = Object.entries(agentData).map(([id, data]) => ({
    id,
    name: data.name,
    description: data.description,
    icon: data.icon,
    status: data.status
  }));
  
  if (!agent && agentId) {
    const [type] = agentId.split('-');
    
    let icon;
    switch (type) {
      case 'home':
        icon = Home;
        break;
      case 'chat':
        icon = MessageSquare;
        break;
      case 'calendar':
        icon = CalendarClock;
        break;
      case 'email':
        icon = Mail;
        break;
      case 'coordinator':
        icon = Router;
        break;
      default:
        icon = Bot;
    }
    
    agent = {
      name: agentId.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
      description: "Custom AI agent",
      icon,
      status: "active" as const,
      integrationUrl: "",
      apiKey: "",
      integrationNotes: "Custom agent configuration",
    };
  }
  
  if (!agent) {
    return <div className="p-6">Agent not found</div>;
  }

  const isCoordinator = agentId === 'coordinator';
  const IconComponent = agent.icon;
  
  const PageTitle = () => (
    <div className="flex flex-col">
      <h1 className="text-xl font-bold tracking-tight">{agent.name}</h1>
      <p className="text-xs text-muted-foreground">{agent.description}</p>
    </div>
  );
  
  return (
    <>
      {pageTitleElement && createPortal(<PageTitle />, pageTitleElement)}
      
      <div className="space-y-6">
        {isCoordinator ? (
          <div className="grid md:grid-cols-2 gap-6">
            <CoordinatorAgent agents={allAgents.filter(a => a.id !== 'coordinator')} />
            <AgentActivity />
          </div>
        ) : (
          <>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="integration">Integration</TabsTrigger>
                <TabsTrigger value="test">Test API</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <AgentDetails agent={agent} />
              </TabsContent>
              
              <TabsContent value="integration" className="space-y-4">
                <AgentIntegration agent={agent} />
              </TabsContent>
              
              <TabsContent value="test" className="space-y-4">
                <AgentTest agentId={agentId} />
              </TabsContent>
              
              <TabsContent value="activity" className="space-y-4">
                <AgentActivity />
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-center mb-4">
              <Button
                variant="outline"
                onClick={() => setShowCoordinator(!showCoordinator)}
                className="gap-2"
              >
                <Router className="h-4 w-4" />
                {showCoordinator ? "Hide Coordinator" : "Show Coordinator Assistant"}
              </Button>
            </div>
            
            {showCoordinator && (
              <div className="animate-in fade-in-50 slide-in-from-bottom-5">
                <CoordinatorAgent agents={allAgents.filter(a => a.id !== 'coordinator')} />
              </div>
            )}
          </>
        )}
        
        <CommandBar />
      </div>
    </>
  );
};

export default AgentPage;
