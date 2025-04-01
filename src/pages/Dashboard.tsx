import React from "react";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { PerformanceStats } from "@/components/dashboard/PerformanceStats";
import { 
  Home, 
  MessageSquare, 
  CalendarClock, 
  Mail, 
  Router, 
  MessagesSquare,
  Facebook,
  Folder,
  FileText,
  MessageCircle,
  FileSpreadsheet
} from "lucide-react";
import { PageTitle } from "@/components/layout/PageTitle";

const Dashboard = () => {
  const agents = [
    {
      id: "coordinator",
      name: "Coordinator Agent",
      description: "Central secretary that routes your requests to the right specialist agents",
      icon: Router,
      status: "active" as const,
      lastActivity: "Just now",
      capabilities: ["Request Routing", "Agent Coordination", "Central Management"],
    },
    {
      id: "home-assistant",
      name: "Home Assistant",
      description: "Controls your smart home devices and automation routines",
      icon: Home,
      status: "active" as const,
      lastActivity: "10 minutes ago",
      capabilities: ["Smart Home", "Automation", "Scene Control"],
    },
    {
      id: "chat-gpt",
      name: "Chat GPT",
      description: "AI assistant that helps with research, writing, and creative tasks",
      icon: MessageSquare,
      status: "active" as const,
      lastActivity: "5 minutes ago",
      capabilities: ["Research", "Writing", "Translation", "Creative"],
    },
    {
      id: "gmail",
      name: "Gmail Agent",
      description: "Manages and organizes your Gmail inbox and communications",
      icon: Mail,
      status: "active" as const,
      lastActivity: "15 minutes ago",
      capabilities: ["Email Mgmt", "Inbox Organization", "Smart Replies"],
    },
    {
      id: "google-drive",
      name: "Google Drive Agent",
      description: "Manages and organizes your files in Google Drive",
      icon: Folder,
      status: "active" as const,
      lastActivity: "30 minutes ago",
      capabilities: ["File Mgmt", "Search", "Organization"],
    },
    {
      id: "telegram",
      name: "Telegram Agent",
      description: "Manages your Telegram conversations and notifications",
      icon: MessagesSquare,
      status: "active" as const,
      lastActivity: "2 hours ago",
      capabilities: ["Messaging", "Notifications", "Chat Mgmt"],
    },
    {
      id: "facebook",
      name: "Facebook Agent",
      description: "Manages your Facebook messages and notifications",
      icon: Facebook,
      status: "idle" as const,
      lastActivity: "1 day ago",
      capabilities: ["Messaging", "Notifications", "Social Updates"],
    },
    {
      id: "zalo",
      name: "Zalo Agent",
      description: "Manages your Zalo communications and notifications",
      icon: MessageCircle,
      status: "active" as const,
      lastActivity: "3 hours ago",
      capabilities: ["Messaging", "Groups", "Media Sharing"],
    },
    {
      id: "google-sheets",
      name: "Google Sheets Agent",
      description: "Manages and analyzes data in Google Sheets spreadsheets",
      icon: FileSpreadsheet,
      status: "active" as const,
      lastActivity: "20 minutes ago",
      capabilities: ["Spreadsheets", "Data Analysis", "Formulas"],
    },
    {
      id: "whatsapp",
      name: "WhatsApp Agent",
      description: "Manages your WhatsApp conversations and notifications",
      icon: MessageSquare,
      status: "active" as const,
      lastActivity: "15 minutes ago",
      capabilities: ["Messaging", "Groups", "Media Sharing"],
    },
  ];

  return (
    <>
      <PageTitle 
        title="Dashboard" 
        subtitle="Manage and monitor your AI agents"
      />
      
      <div className="space-y-5">
        <div className="grid gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} {...agent} />
          ))}
        </div>

        <div className="grid gap-5">
          <PerformanceStats />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
