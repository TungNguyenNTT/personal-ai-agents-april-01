import { createContext, useState, useContext, useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";
import { config } from "@/config/environment";

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface SuggestionChip {
  id: string;
  text: string;
  action?: string;
}

export type ActivityType = "message" | "task" | "query" | "system" | "alert" | "update" | "action" | "warning" | "error" | "success";
export type ActivityStatus = "pending" | "in-progress" | "completed" | "error" | "failed" | "urgent" | "processing";
export type ActivityPriority = "low" | "medium" | "high" | "urgent";

export interface Activity {
  id: string;
  type: ActivityType;
  agent: string;
  agentId: string;
  content: string;
  detailedContent?: string;
  timestamp: Date;
  lastUpdateTime?: Date;
  status?: ActivityStatus;
  priority?: ActivityPriority;
  dismissed?: boolean;
  read?: boolean;
  suggestionChips?: SuggestionChip[];
  attachments?: Attachment[];
}

interface ActivityContextType {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => Promise<string>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  dismissActivity: (id: string) => Promise<void>;
  clearActivities: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const useActivity = (): ActivityContextType => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
};

interface ActivityProviderProps {
  children: ReactNode;
}

const convertSupabaseActivity = (item: any): Activity => {
  return {
    id: item.id,
    type: item.type as ActivityType,
    agent: item.agent,
    agentId: item.agent_id,
    content: item.content,
    detailedContent: item.detailed_content,
    timestamp: new Date(item.timestamp),
    lastUpdateTime: item.updated_at ? new Date(item.updated_at) : undefined,
    status: item.status as ActivityStatus | undefined,
    priority: item.priority as ActivityPriority | undefined,
    dismissed: item.dismissed,
    read: item.read,
    suggestionChips: item.suggestion_chips as SuggestionChip[] | undefined,
    attachments: item.attachments as Attachment[] | undefined,
  };
};

const isValidTransition = (oldStatus: ActivityStatus | undefined, newStatus: ActivityStatus): boolean => {
  if (oldStatus === 'completed') {
    return false; // Never update a completed activity
  }
  return true;
};

export const ActivityProvider: React.FC<ActivityProviderProps> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchActivities();
      
      const sessionId = crypto.randomUUID();
      console.log("🔌 Setting up realtime subscription for user:", {
        userId: user.id,
        sessionId,
        timestamp: new Date().toISOString()
      });
      
      // Set up realtime subscription with specific events and unique channel name
      const channel = supabase
        .channel(`activities-channel-${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'activities',
            filter: `user_id=eq.${user.id}`  // Only filter by user_id
          },
          (payload: any) => {
            if (!payload.new) return;

            console.log("🔄 UPDATE event received:", {
              id: payload.new.id,
              oldStatus: payload.old?.status,
              newStatus: payload.new.status,
              updatedAt: payload.new.updated_at,
              detailedContent: payload.new.detailed_content?.substring(0, 50) // Log first 50 chars of content
            });
            
            try {
              const updatedActivity = convertSupabaseActivity(payload.new);
              setActivities(prev => {
                const currentActivity = prev.find(a => a.id === updatedActivity.id);
                if (!currentActivity) {
                  console.log("⚠️ Activity not found in state, adding:", updatedActivity.id);
                  return [...prev, updatedActivity];
                }

                // Check if this update is older than our current state
                const currentUpdateTime = currentActivity.lastUpdateTime?.getTime() || 0;
                const newUpdateTime = updatedActivity.lastUpdateTime?.getTime() || 0;
                
                if (newUpdateTime < currentUpdateTime) {
                  console.log("⏰ Skipping older update:", {
                    id: updatedActivity.id,
                    currentTime: currentActivity.lastUpdateTime?.toISOString(),
                    updateTime: updatedActivity.lastUpdateTime?.toISOString()
                  });
                  return prev;
                }

                console.log("✨ Applying update:", {
                  id: updatedActivity.id,
                  oldStatus: currentActivity.status,
                  newStatus: updatedActivity.status,
                  updatedAt: payload.new.updated_at
                });

                return prev.map(activity => 
                  activity.id === updatedActivity.id ? updatedActivity : activity
                );
              });
            } catch (error) {
              console.error("❌ Error processing UPDATE:", {
                error,
                payload: payload.new
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activities',
            filter: `user_id=eq.${user.id}`
          },
          (payload: any) => {
            console.log("➕ INSERT event received:", {
              id: payload.new?.id,
              type: payload.new?.type,
              status: payload.new?.status
            });
            
            if (payload.new) {
              try {
                const newActivity = convertSupabaseActivity(payload.new);
                setActivities(prev => {
                  // Check if activity already exists
                  const exists = prev.some(activity => activity.id === newActivity.id);
                  if (exists) {
                    console.log("🔄 Activity already exists, skipping:", newActivity.id);
                    return prev;
                  }
                  return [newActivity, ...prev];
                });
              } catch (error) {
                console.error("❌ Error processing INSERT:", error);
              }
            }
          }
        );

      // Subscribe with basic error handling
      channel
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log("✅ Realtime subscription active");
          } else if (status === 'CHANNEL_ERROR') {
            console.error("❌ Channel error:", err);
            setTimeout(() => channel.subscribe(), 1000);
          } else if (status === 'TIMED_OUT') {
            console.error("⏰ Channel timed out");
            setTimeout(() => channel.subscribe(), 1000);
          }
        });

      return () => {
        console.log("🔌 Cleaning up realtime subscription");
        channel.unsubscribe();
      };
    }
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error("Error fetching activities:", error);
        return;
      }

      if (data) {
        const formattedActivities: Activity[] = data.map(convertSupabaseActivity);
        setActivities(formattedActivities);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const addActivity = async (activity: Omit<Activity, "id" | "timestamp">): Promise<string> => {
    if (!user) {
      console.error("User not authenticated");
      throw new Error("User not authenticated");
    }

    const id = crypto.randomUUID();
    const timestamp = new Date();
    
    const newActivity: Activity = {
      ...activity,
      id,
      timestamp,
      read: activity.read !== undefined ? activity.read : false,
    };
    
    setActivities(prev => [...prev, newActivity]);

    try {
      console.log("💾 Saving activity to Supabase:", {
        id: newActivity.id, 
        type: newActivity.type,
        agent: newActivity.agent
      });
      
      const supabaseActivity = {
        id: newActivity.id,
        user_id: user.id,
        type: newActivity.type,
        agent: newActivity.agent,
        agent_id: newActivity.agentId,
        content: newActivity.content,
        detailed_content: newActivity.detailedContent,
        timestamp: newActivity.timestamp.toISOString(),
        status: newActivity.status,
        priority: newActivity.priority,
        dismissed: newActivity.dismissed || false,
        read: newActivity.read || false,
        suggestion_chips: newActivity.suggestionChips ? JSON.parse(JSON.stringify(newActivity.suggestionChips)) : null,
        attachments: newActivity.attachments ? JSON.parse(JSON.stringify(newActivity.attachments)) : null
      };

      const { error } = await supabase
        .from('activities')
        .insert(supabaseActivity);

      if (error) {
        console.error("Error saving activity:", error);
        throw error;
      }

      console.log("✅ Activity saved to Supabase:", newActivity.id);
      
      return id;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const sendToN8N = async (activity: Activity) => {
    try {
      const N8N_WEBHOOK_URL = config.n8nWebhook;
      
      console.log("🔄 Preparing to send activity to N8N webhook:", N8N_WEBHOOK_URL);
      
      if (N8N_WEBHOOK_URL && N8N_WEBHOOK_URL.startsWith('http')) {
        console.log("📤 Sending activity to N8N:", activity.id);
        
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            activity: {
              id: activity.id,
              type: activity.type,
              agent: activity.agent,
              agentId: activity.agentId,
              content: activity.content,
              timestamp: activity.timestamp,
              status: activity.status,
              attachments: activity.attachments,
            },
            user: {
              id: user?.id,
              email: user?.email,
            }
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("⚠️ Failed to send activity to N8N:", errorText);
          console.error("Status:", response.status, response.statusText);
        } else {
          console.log("✅ Successfully sent activity to N8N");
          const responseData = await response.json().catch(() => null);
          if (responseData) {
            console.log("📥 N8N response:", responseData);
          }
        }
      } else {
        console.log("⚠️ N8N webhook URL not configured or invalid:", N8N_WEBHOOK_URL);
        if (config.useMockMode) {
          console.log("💡 Running in mock mode - activity not sent to n8n");
        }
      }
    } catch (error) {
      console.error("🔴 Error sending to N8N:", error);
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>): Promise<void> => {
    if (!user) {
      console.error("User not authenticated");
      throw new Error("User not authenticated");
    }
    
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id ? { ...activity, ...updates } : activity
      )
    );

    try {
      const supabaseUpdates: Record<string, any> = {};
      
      if (updates.content !== undefined) supabaseUpdates.content = updates.content;
      if (updates.detailedContent !== undefined) supabaseUpdates.detailed_content = updates.detailedContent;
      if (updates.status !== undefined) supabaseUpdates.status = updates.status;
      if (updates.priority !== undefined) supabaseUpdates.priority = updates.priority;
      if (updates.dismissed !== undefined) supabaseUpdates.dismissed = updates.dismissed;
      if (updates.read !== undefined) supabaseUpdates.read = updates.read;
      
      if (updates.suggestionChips !== undefined) {
        supabaseUpdates.suggestion_chips = updates.suggestionChips ? 
          JSON.parse(JSON.stringify(updates.suggestionChips)) : null;
      }
      
      if (updates.attachments !== undefined) {
        supabaseUpdates.attachments = updates.attachments ? 
          JSON.parse(JSON.stringify(updates.attachments)) : null;
      }
      
      supabaseUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('activities')
        .update(supabaseUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error updating activity:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const dismissActivity = async (id: string): Promise<void> => {
    await updateActivity(id, { dismissed: true });
  };

  const clearActivities = async (): Promise<void> => {
    if (!user) {
      console.error("User not authenticated");
      throw new Error("User not authenticated");
    }
    
    setActivities([]);

    try {
      const { error } = await supabase
        .from('activities')
        .update({ dismissed: true })
        .eq('user_id', user.id);

      if (error) {
        console.error("Error clearing activities:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const markAsRead = async (id: string): Promise<void> => {
    await updateActivity(id, { read: true });
  };

  const markAsUnread = async (id: string): Promise<void> => {
    await updateActivity(id, { read: false });
  };

  const markAllAsRead = async (): Promise<void> => {
    if (!user) {
      console.error("User not authenticated");
      throw new Error("User not authenticated");
    }
    
    setActivities(prev => 
      prev.map(activity => ({ ...activity, read: true }))
    );

    try {
      const { error } = await supabase
        .from('activities')
        .update({ read: true })
        .eq('user_id', user.id)
        .is('read', false);

      if (error) {
        console.error("Error marking all as read:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  return (
    <ActivityContext.Provider value={{ 
      activities, 
      addActivity, 
      updateActivity, 
      dismissActivity, 
      clearActivities,
      markAsRead,
      markAsUnread,
      markAllAsRead
    }}>
      {children}
    </ActivityContext.Provider>
  );
};
