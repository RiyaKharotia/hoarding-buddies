import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Bell, 
  Key, 
  Shield, 
  Upload,
  Save,
  Smartphone
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PhotographerSettings: React.FC = () => {
  const { user } = useAuth();
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Settings saved", {
      description: "Your settings have been updated successfully"
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="equipment">
            <Camera className="mr-2 h-4 w-4" />
            Equipment
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm" className="mb-2">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload new photo
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        JPG, GIF or PNG. Max size of 800K
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="name" defaultValue={user?.name} className="pl-10" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email" type="email" defaultValue={user?.email} className="pl-10" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="phone" type="tel" defaultValue="+1 555-123-4567" className="pl-10" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="location" defaultValue="Bangalore, India" className="pl-10" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      rows={4}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue="Professional photographer with 5 years of experience in outdoor and billboard photography."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <CardTitle>Camera Equipment</CardTitle>
              <CardDescription>Add and manage your photography equipment</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="camera">Camera Model</Label>
                      <div className="relative">
                        <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="camera" defaultValue="Canon EOS R5" className="pl-10" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lens">Primary Lens</Label>
                      <div className="relative">
                        <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="lens" defaultValue="Canon RF 24-70mm f/2.8L" className="pl-10" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone-model">Smartphone Model</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone-model" defaultValue="iPhone 13 Pro" className="pl-10" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="other-equipment">Other Equipment</Label>
                    <textarea
                      id="other-equipment"
                      rows={3}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue="Tripod: Manfrotto MT190XPRO4
DJI Mini 3 Pro Drone
Canon Speedlite 600EX II-RT Flash"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Equipment Details
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">New Assignments</span>
                        <span className="text-sm text-muted-foreground">Receive emails when new hoardings are assigned to you</span>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Upcoming Deadlines</span>
                        <span className="text-sm text-muted-foreground">Receive emails about approaching assignment deadlines</span>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Photo Feedback</span>
                        <span className="text-sm text-muted-foreground">Receive emails when clients or admin comments on your photos</span>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium pt-4">Mobile Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Push Notifications</span>
                        <span className="text-sm text-muted-foreground">Enable push notifications on your mobile device</span>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reminder-time">Daily Reminder Time</Label>
                      <Select defaultValue="9am">
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7am">7:00 AM</SelectItem>
                          <SelectItem value="8am">8:00 AM</SelectItem>
                          <SelectItem value="9am">9:00 AM</SelectItem>
                          <SelectItem value="10am">10:00 AM</SelectItem>
                          <SelectItem value="off">Turn off daily reminders</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Receive a daily summary of your pending assignments
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Notification Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and account security</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="current-password" type="password" className="pl-10" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="new-password" type="password" className="pl-10" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="confirm-password" type="password" className="pl-10" />
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium pt-4">Login Security</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Location Tracking</span>
                        <span className="text-sm text-muted-foreground">Allow the app to access your location for assignment proximity alerts</span>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Stay Logged In</span>
                        <span className="text-sm text-muted-foreground">Keep your session active for 30 days</span>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Security Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PhotographerSettings;
