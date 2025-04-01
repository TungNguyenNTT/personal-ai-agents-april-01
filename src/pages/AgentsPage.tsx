import React, { useState } from "react";
import { 
  Home, 
  MessageSquare, 
  Bot, 
  Users, 
  CalendarClock, 
  Mail, 
  AlertCircle, 
  FileText, 
  Folder, 
  MessagesSquare, 
  Facebook, 
  MessageCircle, 
  Smartphone,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddAgentDialog } from "@/components/AddAgentDialog";
import { PageTitle } from "@/components/layout/PageTitle";

const AgentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [agents, setAgents] = useState([
    {
      id: "home-assistant",
      name: "Home Assistant",
      description: "Controls your smart home devices and automation routines",
      icon: Home,
      status: "active" as const,
      lastActivity: "2 hours ago",
      capabilities: ["Home Automation", "Device Control", "Scheduling"]
    },
    {
      id: "chat-gpt",
      name: "Chat GPT",
      description: "AI assistant that helps with research, writing, and creative tasks",
      icon: MessageSquare,
      status: "active" as const,
      lastActivity: "10 minutes ago",
      capabilities: ["Text Generation", "Research", "Summarization"]
    },
    {
      id: "calendar",
      name: "Calendar Assistant",
      description: "Manages your schedule, meetings, and sends reminders",
      icon: CalendarClock,
      status: "idle" as const,
      lastActivity: "1 day ago",
      capabilities: ["Scheduling", "Reminders", "Meeting Management"]
    },
    {
      id: "email",
      name: "Email Assistant",
      description: "Organizes inbox, drafts responses, and filters spam",
      icon: Mail,
      status: "error" as const,
      lastActivity: "3 days ago",
      capabilities: ["Email Organization", "Response Templates", "Spam Filtering"]
    },
    {
      id: "gmail",
      name: "Gmail Agent",
      description: "Manages and organizes your Gmail inbox and communications",
      icon: Mail,
      status: "active" as const,
      lastActivity: "15 minutes ago",
      capabilities: ["Email Mgmt", "Inbox Organization", "Smart Replies"]
    },
    {
      id: "google-drive",
      name: "Google Drive Agent",
      description: "Manages and organizes your files in Google Drive",
      icon: Folder,
      status: "active" as const,
      lastActivity: "30 minutes ago",
      capabilities: ["File Mgmt", "Search", "Organization"]
    },
    {
      id: "google-docs",
      name: "Google Docs Agent",
      description: "Creates and edits documents in Google Docs",
      icon: FileText,
      status: "idle" as const,
      lastActivity: "2 days ago",
      capabilities: ["Document Creation", "Editing", "Collaboration"]
    },
    {
      id: "telegram",
      name: "Telegram Agent",
      description: "Manages your Telegram conversations and notifications",
      icon: MessagesSquare,
      status: "active" as const,
      lastActivity: "2 hours ago",
      capabilities: ["Messaging", "Notifications", "Chat Management"]
    },
    {
      id: "facebook",
      name: "Facebook Agent",
      description: "Manages your Facebook messages and notifications",
      icon: Facebook,
      status: "idle" as const,
      lastActivity: "1 day ago",
      capabilities: ["Messaging", "Notifications", "Social Updates"]
    },
    {
      id: "zalo",
      name: "Zalo Agent",
      description: "Manages your Zalo communications and notifications",
      icon: MessageCircle,
      status: "active" as const,
      lastActivity: "3 hours ago",
      capabilities: ["Messaging", "Groups", "Media Sharing"]
    },
    {
      id: "ott",
      name: "OTT Assistant",
      description: "Manages various OTT messaging services and applications",
      icon: Smartphone,
      status: "idle" as const,
      lastActivity: "12 hours ago",
      capabilities: ["Multiple Platforms", "Media Sharing", "Notifications"]
    },
    {
      id: "google-sheets",
      name: "Google Sheets Agent",
      description: "Manages and analyzes data in Google Sheets spreadsheets",
      icon: FileSpreadsheet,
      status: "active" as const,
      lastActivity: "45 minutes ago",
      capabilities: ["Spreadsheets", "Data Analysis", "Formulas"]
    },
    {
      id: "whatsapp",
      name: "WhatsApp Agent",
      description: "Manages your WhatsApp conversations and notifications",
      icon: MessageSquare,
      status: "active" as const,
      lastActivity: "30 minutes ago",
      capabilities: ["Messaging", "Groups", "Media Sharing"]
    },
    {
      id: "data-analyzer",
      name: "Data Analyzer",
      description: "Analyzes data from various sources to provide insights",
      icon: AlertCircle,
      status: "active" as const,
      lastActivity: "5 hours ago",
      capabilities: ["Data Analysis", "Visualization", "Trend Detection"]
    },
    {
      id: "customer-service",
      name: "Customer Service Bot",
      description: "Handles customer inquiries and support tickets",
      icon: Users,
      status: "idle" as const,
      lastActivity: "12 hours ago",
      capabilities: ["Customer Support", "Ticket Management", "FAQ Responses"]
    }
  ]);

  const handleAddAgent = (newAgent: any) => {
    const iconMap: Record<string, React.ElementType> = {
      home: Home,
      chat: MessageSquare,
      calendar: CalendarClock,
      email: Mail,
      custom: Bot
    };
    
    const agentWithIcon = {
      ...newAgent,
      icon: iconMap[newAgent.id.split('-')[0]] || Bot,
      status: "active" as const,
      lastActivity: "Just now",
      capabilities: ["Custom Assistant", "Integration"]
    };
    
    setAgents([...agents, agentWithIcon]);
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || agent.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageTitle 
        title="AI Agents" 
        subtitle="Manage and monitor your intelligent agents" 
      />
      
      <div className="space-y-3 md:space-y-4">
        <div className="flex justify-end">
          <Button 
            onClick={() => setDialogOpen(true)}
            className="w-full md:w-auto"
            size="sm"
          >
            Create New Agent
          </Button>
        </div>
        
        <div className="grid gap-3 md:gap-4 md:grid-cols-2">
          <div>
            <Input
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredAgents.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No agents found</CardTitle>
              <CardDescription>
                Try adjusting your search or filter criteria
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                id={agent.id}
                name={agent.name}
                description={agent.description}
                icon={agent.icon}
                status={agent.status}
                lastActivity={agent.lastActivity}
                capabilities={agent.capabilities}
              />
            ))}
          </div>
        )}
        
        <AddAgentDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
          onAgentAdded={handleAddAgent} 
        />
      </div>
    </>
  );
};

export default AgentsPage;
