
import React, { createContext, useContext, useState, ReactNode } from "react";
import { 
  Home, 
  MessageSquare, 
  CalendarClock, 
  Mail, 
  Router, 
  FileText, 
  Folder, 
  MessagesSquare,
  Facebook, 
  MessageCircle,
  Smartphone,
  FileSpreadsheet,
  MessageSquare as WhatsAppIcon
} from "lucide-react";

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "active" | "idle" | "error";
  integrationUrl?: string;
  apiKey?: string;
  integrationNotes?: string;
}

const initialAgents: Agent[] = [
  {
    id: "coordinator",
    name: "Coordinator Agent",
    description: "Routes your requests to the most appropriate agent",
    icon: Router,
    status: "active",
  },
  {
    id: "home-assistant",
    name: "Home Assistant",
    description: "Controls your smart home devices and automation routines",
    icon: Home,
    status: "active",
  },
  {
    id: "chat-gpt",
    name: "Chat GPT",
    description: "AI assistant that helps with research, writing, and creative tasks",
    icon: MessageSquare,
    status: "active",
  },
  {
    id: "calendar",
    name: "Calendar Assistant",
    description: "Manages your schedule, meetings, and sends reminders",
    icon: CalendarClock,
    status: "idle",
  },
  {
    id: "email",
    name: "Email Assistant",
    description: "Organizes inbox, drafts responses, and filters spam",
    icon: Mail,
    status: "error",
  },
  {
    id: "gmail",
    name: "Gmail Agent",
    description: "Manages and organizes your Gmail inbox and communications",
    icon: Mail,
    status: "active",
  },
  {
    id: "google-drive",
    name: "Google Drive Agent",
    description: "Manages and organizes your files in Google Drive",
    icon: Folder,
    status: "active",
  },
  {
    id: "google-docs",
    name: "Google Docs Agent",
    description: "Creates and edits documents in Google Docs",
    icon: FileText,
    status: "idle",
  },
  {
    id: "telegram",
    name: "Telegram Agent",
    description: "Manages your Telegram conversations and notifications",
    icon: MessagesSquare,
    status: "active",
  },
  {
    id: "facebook",
    name: "Facebook Agent",
    description: "Manages your Facebook messages and notifications",
    icon: Facebook,
    status: "idle",
  },
  {
    id: "zalo",
    name: "Zalo Agent",
    description: "Manages your Zalo communications and notifications",
    icon: MessageCircle,
    status: "active",
  },
  {
    id: "ott",
    name: "OTT Assistant",
    description: "Manages various OTT messaging services and applications",
    icon: Smartphone,
    status: "idle",
  },
  {
    id: "google-sheets",
    name: "Google Sheets Agent",
    description: "Manages and analyzes data in Google Sheets spreadsheets",
    icon: FileSpreadsheet,
    status: "active",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Agent",
    description: "Manages your WhatsApp conversations and notifications",
    icon: WhatsAppIcon,
    status: "active",
  }
];

interface AgentContextType {
  agents: Agent[];
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, agent: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider = ({ children }: { children: ReactNode }) => {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);

  const addAgent = (agent: Agent) => {
    setAgents((prevAgents) => [...prevAgents, agent]);
  };

  const updateAgent = (id: string, updatedAgent: Partial<Agent>) => {
    setAgents((prevAgents) =>
      prevAgents.map((agent) =>
        agent.id === id ? { ...agent, ...updatedAgent } : agent
      )
    );
  };

  const removeAgent = (id: string) => {
    setAgents((prevAgents) => prevAgents.filter((agent) => agent.id !== id));
  };

  return (
    <AgentContext.Provider value={{ agents, addAgent, updateAgent, removeAgent }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgents = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error("useAgents must be used within an AgentProvider");
  }
  return context;
};
