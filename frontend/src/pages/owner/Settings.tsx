
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Globe, 
  Bell, 
  Key, 
  Shield, 
  Upload,
  Save,
  Loader2
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import api from '@/services/api';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || ''
  });
  
  // Company form state
  const [companyData, setCompanyData] = useState({
    companyName: user?.companyName || '',
    website: user?.website || '',
    address: user?.address || ''
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    contractUpdates: true,
    clientMessages: true,
    billingNotifications: true,
    browserNotifications: false,
    smsAlerts: false
  });
  
  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || ''
      });
      
      setCompanyData({
        companyName: user.companyName || '',
        website: user.website || '',
        address: user.address || ''
      });
    }
  }, [user]);
  
  // Handle profile form submission
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('email', profileData.email);
      formData.append('phone', profileData.phone);
      formData.append('location', profileData.location);
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      const response = await api.put('/api/users/profile', formData);
      
      if (response.data && response.data.data) {
        // Update local user state with new data
        updateUser({
          ...user,
          ...response.data.data
        });
        
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle company form submission
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.put('/api/users/profile', {
        companyName: companyData.companyName,
        website: companyData.website,
        address: companyData.address
      });
      
      if (response.data && response.data.data) {
        // Update local user state with new data
        updateUser({
          ...user,
          ...response.data.data
        });
        
        toast.success("Company information updated successfully");
      }
    } catch (error) {
      console.error("Failed to update company information:", error);
      toast.error("Failed to update company information. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      setLoading(false);
      return;
    }
    
    try {
      await api.put('/api/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success("Password changed successfully");
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error("Failed to change password. Please verify your current password is correct.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle notification settings save
  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real application, we would save these settings to the backend
      // For now, we'll just show a success message
      setTimeout(() => {
        toast.success("Notification preferences saved");
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("Failed to save notification preferences:", error);
      toast.error("Failed to save notification preferences. Please try again.");
      setLoading(false);
    }
  };
  
  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };
  
  // Handle profile form input changes
  const handleProfileInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle company form input changes
  const handleCompanyInputChange = (field: string, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle password form input changes
  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle notification toggle
  const handleNotificationToggle = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
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
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-24 w-24">
                      {avatarPreview ? (
                        <AvatarImage src={avatarPreview} alt={user?.name} />
                      ) : (
                        <>
                          <AvatarImage src={user?.avatar} alt={user?.name} />
                          <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div>
                      <div className="mb-2">
                        <Input
                          id="avatar"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <label htmlFor="avatar">
                          <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                            <span>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload new photo
                            </span>
                          </Button>
                        </label>
                      </div>
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
                        <Input 
                          id="name" 
                          value={profileData.name}
                          onChange={e => handleProfileInputChange('name', e.target.value)}
                          className="pl-10" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email" 
                          type="email"
                          value={profileData.email}
                          onChange={e => handleProfileInputChange('email', e.target.value)}
                          className="pl-10" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="phone" 
                          type="tel"
                          value={profileData.phone}
                          onChange={e => handleProfileInputChange('phone', e.target.value)}
                          className="pl-10" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="location"
                          value={profileData.location}
                          onChange={e => handleProfileInputChange('location', e.target.value)}
                          className="pl-10" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
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
              <CardDescription>Update your company details and branding</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveCompany} className="space-y-6">
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
                        <Input 
                          id="company-name"
                          value={companyData.companyName}
                          onChange={e => handleCompanyInputChange('companyName', e.target.value)}
                          className="pl-10" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="website" 
                          type="url"
                          value={companyData.website}
                          onChange={e => handleCompanyInputChange('website', e.target.value)}
                          className="pl-10" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-5 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <textarea
                          id="address"
                          rows={3}
                          value={companyData.address}
                          onChange={e => handleCompanyInputChange('address', e.target.value)}
                          className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
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
              <form onSubmit={handleSaveNotifications} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">New Photo Uploads</span>
                        <span className="text-sm text-muted-foreground">Receive emails when photographers upload new photos</span>
                      </div>
                      <Switch 
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => handleNotificationToggle('emailNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Contract Updates</span>
                        <span className="text-sm text-muted-foreground">Receive emails when contracts are created or updated</span>
                      </div>
                      <Switch 
                        checked={notificationSettings.contractUpdates}
                        onCheckedChange={(checked) => handleNotificationToggle('contractUpdates', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Client Messages</span>
                        <span className="text-sm text-muted-foreground">Receive emails when clients send messages</span>
                      </div>
                      <Switch 
                        checked={notificationSettings.clientMessages}
                        onCheckedChange={(checked) => handleNotificationToggle('clientMessages', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Billing Notifications</span>
                        <span className="text-sm text-muted-foreground">Receive emails about invoices and payments</span>
                      </div>
                      <Switch 
                        checked={notificationSettings.billingNotifications}
                        onCheckedChange={(checked) => handleNotificationToggle('billingNotifications', checked)}
                      />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium pt-4">System Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Browser Notifications</span>
                        <span className="text-sm text-muted-foreground">Show browser notifications for important events</span>
                      </div>
                      <Switch 
                        checked={notificationSettings.browserNotifications}
                        onCheckedChange={(checked) => handleNotificationToggle('browserNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">SMS Alerts</span>
                        <span className="text-sm text-muted-foreground">Receive text messages for critical updates</span>
                      </div>
                      <Switch 
                        checked={notificationSettings.smsAlerts}
                        onCheckedChange={(checked) => handleNotificationToggle('smsAlerts', checked)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Preferences
                      </>
                    )}
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
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="current-password" 
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                          className="pl-10" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="new-password" 
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                          className="pl-10" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="confirm-password" 
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                          className="pl-10" 
                        />
                      </div>
                      {passwordData.newPassword && passwordData.confirmPassword && 
                       passwordData.newPassword !== passwordData.confirmPassword && (
                        <p className="text-xs text-red-500">Passwords do not match</p>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium pt-4">Two-Factor Authentication</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Enable Two-Factor Authentication</span>
                        <span className="text-sm text-muted-foreground">Add an extra layer of security to your account</span>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium pt-4">Session Management</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Current Sessions</span>
                        <span className="text-sm text-muted-foreground">You are currently logged in on 1 device</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Log Out All Devices
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={
                      loading || 
                      !passwordData.currentPassword || 
                      !passwordData.newPassword ||
                      passwordData.newPassword !== passwordData.confirmPassword
                    }
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Security Settings
                      </>
                    )}
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

export default Settings;
