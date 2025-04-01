
import { cn } from "@/lib/utils";
import type { ActivityType } from "./ActivityFeed";

// Get class names for agent avatar based on agent ID
export const getAgentAvatarClasses = (agentId: string): string => {
  switch (agentId) {
    case "home-assistant":
      return "bg-emerald-500 text-white";
    case "calendar":
      return "bg-blue-500 text-white";
    case "email":
      return "bg-purple-500 text-white";
    case "chat-gpt":
      return "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-800";
    case "coordinator":
      return "bg-blue-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

// Get class names for agent bubble based on agent ID
export const getAgentBubbleClasses = (agentId: string): string => {
  switch (agentId) {
    case "home-assistant":
      return "bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900";
    case "calendar":
      return "bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-900";
    case "email":
      return "bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-900";
    case "chat-gpt":
      return "bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700";
    case "coordinator":
      return "bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-900";
    default:
      return "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700";
  }
};

// Get class names for agent chips based on agent ID
export const getAgentChipClasses = (agentId: string): string => {
  switch (agentId) {
    case "home-assistant":
      return "border-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:border-emerald-800 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-400";
    case "calendar":
      return "border-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-800 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-400";
    case "email":
      return "border-purple-300 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:border-purple-800 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-400";
    case "chat-gpt":
      return "border-neutral-300 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300";
    case "coordinator":
      return "border-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-800 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-400";
    default:
      return "border-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-400";
  }
};

// Get agent ID from name
export const getAgentIdFromName = (agentName?: string): string => {
  if (!agentName) return "chat-gpt";
  
  const nameLower = agentName.toLowerCase();
  if (nameLower.includes("home")) return "home-assistant";
  if (nameLower.includes("calendar")) return "calendar";
  if (nameLower.includes("email")) return "email";
  if (nameLower.includes("coordinator")) return "coordinator";
  if (nameLower.includes("chat") || nameLower.includes("gpt")) return "chat-gpt";
  
  return "chat-gpt";
};

// Get color class for agent dot
export const getAgentDotColor = (agentId: string): string => {
  switch (agentId) {
    case "home-assistant":
      return "bg-emerald-500";
    case "calendar":
      return "bg-blue-500";
    case "email":
      return "bg-purple-500";
    case "coordinator":
      return "bg-blue-500";
    case "chat-gpt":
      return "bg-neutral-700 dark:bg-neutral-300";
    default:
      return "bg-gray-500";
  }
};

// Get color class for activity type dot
export const getActivityTypeColor = (type: ActivityType): string => {
  switch (type) {
    case "message":
      return "bg-blue-500";
    case "task":
      return "bg-amber-500";
    case "alert":
      return "bg-red-500";
    case "update":
      return "bg-emerald-500";
    case "query":
      return "bg-purple-500";
    default:
      return "bg-gray-500";
  }
};
