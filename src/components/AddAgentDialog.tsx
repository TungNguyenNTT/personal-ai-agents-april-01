
import { useForm } from "react-hook-form";
import { PlusCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAgents } from "@/contexts/AgentContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Define validation schema for the form
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  type: z.enum([
    "home", "chat", "calendar", "email", "custom", 
    "gmail", "google-drive", "google-docs", 
    "telegram", "facebook", "zalo", "ott",
    "google-sheets", "whatsapp"
  ]),
  integrationUrl: z.string().optional(),
  apiKey: z.string().optional(),
  integrationNotes: z.string().optional(),
});

type AddAgentFormValues = z.infer<typeof formSchema>;

interface AddAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentAdded: (agent: any) => void;
}

// Map of agent types to their respective icons
const agentTypeToIcon: Record<string, string> = {
  home: "Home",
  chat: "MessageSquare",
  calendar: "CalendarClock",
  email: "Mail",
  gmail: "Mail",
  "google-drive": "Folder",
  "google-docs": "FileText",
  telegram: "BrandTelegram",
  facebook: "Facebook",
  zalo: "MessageCircle",
  ott: "Smartphone",
  custom: "PlusCircle",
};

export function AddAgentDialog({ open, onOpenChange, onAgentAdded }: AddAgentDialogProps) {
  const navigate = useNavigate();
  const { addAgent } = useAgents();

  const form = useForm<AddAgentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "custom",
      integrationUrl: "",
      apiKey: "",
      integrationNotes: "",
    },
  });

  const onSubmit = (values: AddAgentFormValues) => {
    // Create a new agent with a unique ID
    const newAgent = {
      id: values.type + "-" + Date.now().toString(),
      name: values.name,
      description: values.description,
      // We'll assign the icon based on the type
      icon: "PlusCircle" as unknown as React.ElementType, // This will be set by the parent
      status: "active" as const,
      integrationUrl: values.integrationUrl,
      apiKey: values.apiKey,
      integrationNotes: values.integrationNotes,
    };

    // Add to global context
    addAgent(newAgent);
    
    // Also call the original onAgentAdded to maintain existing behavior
    onAgentAdded(newAgent);
    
    toast.success("Agent added successfully");
    form.reset();
    onOpenChange(false);
    
    // Navigate to activities page to see the new agent
    navigate("/activities");
  };

  const selectedType = form.watch("type");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Agent</DialogTitle>
          <DialogDescription>
            Create a new AI agent to help you with tasks.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Agent" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select agent type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="home">Home Assistant</SelectItem>
                        <SelectItem value="chat">Chat Assistant</SelectItem>
                        <SelectItem value="calendar">Calendar Assistant</SelectItem>
                        <SelectItem value="email">Email Assistant</SelectItem>
                        <SelectItem value="gmail">Gmail Agent</SelectItem>
                        <SelectItem value="google-drive">Google Drive Agent</SelectItem>
                        <SelectItem value="google-docs">Google Docs Agent</SelectItem>
                        <SelectItem value="telegram">Telegram Agent</SelectItem>
                        <SelectItem value="facebook">Facebook Agent</SelectItem>
                        <SelectItem value="zalo">Zalo Agent</SelectItem>
                        <SelectItem value="ott">OTT Assistant</SelectItem>
                        <SelectItem value="google-sheets">Google Sheets Agent</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp Agent</SelectItem>
                        <SelectItem value="custom">Custom Assistant</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="This agent helps with..."
                      {...field}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="border p-4 rounded-md space-y-4">
              <h3 className="text-sm font-medium">Integration Details</h3>
              
              <FormField
                control={form.control}
                name="integrationUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Integration URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={
                          selectedType === "home" ? "http://your-home-assistant.local:8123/api" : 
                          selectedType === "chat" ? "https://api.openai.com/v1" :
                          selectedType === "calendar" ? "https://www.googleapis.com/calendar/v3" :
                          selectedType === "email" ? "https://api.sendgrid.com/v3" :
                          selectedType === "gmail" ? "https://gmail.googleapis.com/gmail/v1" :
                          selectedType === "google-drive" ? "https://www.googleapis.com/drive/v3" :
                          selectedType === "google-docs" ? "https://docs.googleapis.com/v1" :
                          selectedType === "telegram" ? "https://api.telegram.org/bot{token}" :
                          selectedType === "facebook" ? "https://graph.facebook.com/v19.0" :
                          selectedType === "zalo" ? "https://openapi.zalo.me/v2.0" :
                          selectedType === "ott" ? "https://api.ott-service.com/v1" :
                          "https://api.example.com"
                        } 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedType === "home" ? "Home Assistant API address" : 
                       selectedType === "chat" ? "Chat API endpoint" :
                       selectedType === "calendar" ? "Calendar API endpoint" :
                       selectedType === "email" ? "Email service webhook" :
                       selectedType === "gmail" ? "Gmail API endpoint" :
                       selectedType === "google-drive" ? "Google Drive API endpoint" :
                       selectedType === "google-docs" ? "Google Docs API endpoint" :
                       selectedType === "telegram" ? "Telegram Bot API endpoint" :
                       selectedType === "facebook" ? "Facebook Graph API endpoint" :
                       selectedType === "zalo" ? "Zalo Open API endpoint" :
                       selectedType === "ott" ? "OTT service API endpoint" :
                       "Webhook or API endpoint for this agent"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key or Token</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Your API key or access token" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Credentials to authenticate with the service
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="integrationNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Integration Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional configuration details..."
                        {...field}
                        rows={2}
                      />
                    </FormControl>
                    <FormDescription>
                      Any additional configuration information needed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="mt-4">
              <Button type="submit">Add Agent</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
