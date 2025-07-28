import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Globe, 
  MapPin, 
  Bell, 
  Key, 
  Upload,
  Save,
  Users
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const ClientSettings: React.FC = () => {
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
          <TabsTrigger value="company">
            <Building className="mr-2 h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="mr-2 h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
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
                      <Label htmlFor="role">Role</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="role" defaultValue="Marketing Manager" className="pl-10" />
                      </div>
                    </div>
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
        
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-24 w-24 bg-gray-100 rounded-md flex items-center justify-center">
                      <Building className="h-12 w-12 text-gray-400" />
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="mb-2">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload company logo
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        JPG, GIF or PNG. Max size of 800K
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="company-name" defaultValue="Supernova Advertising" className="pl-10" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="website" type="url" defaultValue="https://supernovaads.com" className="pl-10" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company-email">Company Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="company-email" type="email" defaultValue="info@supernovaads.com" className="pl-10" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company-phone">Company Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="company-phone" type="tel" defaultValue="+1 555-987-6543" className="pl-10" />
                      </div>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Company Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-5 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <textarea
                          id="address"
                          rows={3}
                          defaultValue="123 Marketing Avenue, Business Park, Bangalore - 560001, Karnataka, India"
                          className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        />
                      </div>
                    </div>
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
        
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage user access to your company dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-end">
                  <Button>
                    <Users className="mr-2 h-4 w-4" />
                    Invite Team Member
                  </Button>
                </div>
                
                <div className="border rounded-md">
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>RS</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Robert Smith</p>
                        <p className="text-sm text-muted-foreground">robert@supernovaads.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Admin</Badge>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Jane Doe</p>
                        <p className="text-sm text-muted-foreground">jane@supernovaads.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Editor</Badge>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>MP</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Mark Peterson</p>
                        <p className="text-sm text-muted-foreground">mark@supernovaads.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Viewer</Badge>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                </div>
              </div>
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
                        <span className="font-medium">Photo Updates</span>
                        <span className="text-sm text-muted-foreground">Receive emails when new photos of your hoardings are uploaded</span>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Contract Updates</span>
                        <span className="text-sm text-muted-foreground">Receive emails when your contracts are updated</span>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Billing Notifications</span>
                        <span className="text-sm text-muted-foreground">Receive emails about invoices and payments</span>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Marketing Communications</span>
                        <span className="text-sm text-muted-foreground">Receive emails about new services and features</span>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
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

export default ClientSettings;
