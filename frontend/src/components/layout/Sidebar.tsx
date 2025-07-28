import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { 
  Home, 
  Image, 
  FileText, 
  Users, 
  Settings,
  MapPin,
  Camera,
  Calendar,
  CreditCard,
  BarChart3,
  User,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const getNavItems = (role: UserRole) => {
  const items = {
    owner: [
      { name: 'Dashboard', path: '/dashboard', icon: Home },
      { name: 'Hoardings', path: '/hoardings', icon: MapPin },
      { name: 'Photographers', path: '/photographers', icon: Camera },
      { name: 'Clients', path: '/clients', icon: Users },
      { name: 'Contracts', path: '/contracts', icon: FileText },
      { name: 'Billings', path: '/billings', icon: CreditCard },
      { name: 'Photos', path: '/photos', icon: Image },
      { name: 'Analytics', path: '/analytics', icon: BarChart3 },
      { name: 'Settings', path: '/settings', icon: Settings },
    ],
    photographer: [
      { name: 'Dashboard', path: '/photographer', icon: Home },
      { name: 'Assignments', path: '/photographer/assignments', icon: MapPin },
      { name: 'Upload Photos', path: '/photographer/upload', icon: Camera },
      { name: 'Photo History', path: '/photographer/history', icon: Image },
      { name: 'Settings', path: '/photographer/settings', icon: Settings },
    ],
    client: [
      { name: 'Dashboard', path: '/client', icon: Home },
      { name: 'My Hoardings', path: '/client/hoardings', icon: MapPin },
      { name: 'My Photos', path: '/client/photos', icon: Image },
      { name: 'Contracts', path: '/client/contracts', icon: FileText },
      { name: 'Billing', path: '/client/billing', icon: CreditCard },
      { name: 'Settings', path: '/client/settings', icon: Settings },
    ],
  };

  return items[role] || [];
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const navItems = getNavItems(user.role);

  const handleLogout = () => {
    logout();
    toast("Logged out successfully", {
      description: "You have been logged out of your account"
    });
  };

  return (
    <div className="bg-sidebar text-sidebar-foreground w-64 flex flex-col border-r border-border">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-brand-blue to-brand-purple-light rounded-md p-1">
            <span className="text-white font-bold text-lg">SM</span>
          </div>
          <h1 className="text-xl font-bold">Show It Max</h1>
        </div>
        <div className="text-xs text-muted-foreground mt-1">Hoarding Management Portal</div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="border-t border-border p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <User className="h-6 w-6 m-2" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
