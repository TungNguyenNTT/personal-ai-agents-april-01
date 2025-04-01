
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

const PageTitle = () => (
  <div className="flex flex-col">
    <h1 className="text-xl font-bold tracking-tight">Settings</h1>
    <p className="text-xs text-muted-foreground">Manage your AI agent preferences and connections</p>
  </div>
);

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSave = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully",
      });
    }, 1000);
  };

  return (
    <>
      {pageTitleElement && createPortal(<PageTitle />, pageTitleElement)}
      
      <div className="w-full space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="w-full">
            <div className="grid gap-6 md:grid-cols-2 w-full">
              <Card>
                <CardHeader>
                  <CardTitle>User Interface</CardTitle>
                  <CardDescription>Customize your dashboard appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <select
                      id="theme"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="dark">Dark (Default)</option>
                      <option value="light">Light</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="animations">Enable animations</Label>
                    <Switch id="animations" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compact">Compact mode</Label>
                    <Switch id="compact" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save changes"}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Configure how you receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push">Push notifications</Label>
                    <Switch id="push" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notif">Email notifications</Label>
                    <Switch id="email-notif" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sounds">Notification sounds</Label>
                    <Switch id="sounds" defaultChecked />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quiet-hours">Quiet hours</Label>
                    <div className="flex gap-2">
                      <Input type="time" id="quiet-hours-start" defaultValue="22:00" />
                      <span className="self-center">to</span>
                      <Input type="time" id="quiet-hours-end" defaultValue="07:00" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save changes"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="agents" className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Agent Configuration</CardTitle>
                <CardDescription>Manage connected AI agents and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Configure which data each AI agent can access and how they interact with your systems.
                </p>
                
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Chat GPT</h4>
                        <p className="text-sm text-muted-foreground">OpenAI's GPT assistant</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Home Assistant</h4>
                        <p className="text-sm text-muted-foreground">Smart home controller</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Calendar Assistant</h4>
                        <p className="text-sm text-muted-foreground">Schedule management</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Assistant</h4>
                        <p className="text-sm text-muted-foreground">Email management</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="mr-2">Add New Agent</Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save all changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage authentication and data protection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Change Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" placeholder="••••••••" />
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <Label htmlFor="2fa">Two-factor authentication</Label>
                  <Switch id="2fa" />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="api-access">API access</Label>
                  <Switch id="api-access" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="data-encryption">End-to-end encryption</Label>
                  <Switch id="data-encryption" defaultChecked />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Update security settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations" className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Third-party Integrations</CardTitle>
                <CardDescription>Connect other services to your AI agents</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Connect your AI command center to external services for enhanced functionality.
                </p>
                
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Google Workspace</h4>
                        <p className="text-sm text-muted-foreground">Gmail, Calendar, Drive</p>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Microsoft 365</h4>
                        <p className="text-sm text-muted-foreground">Outlook, Teams, OneDrive</p>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Slack</h4>
                        <p className="text-sm text-muted-foreground">Team communication</p>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Notion</h4>
                        <p className="text-sm text-muted-foreground">Notes and documents</p>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="mr-2">Add New Integration</Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Settings;
