
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Camera, CreditCard, MapPin, Users } from 'lucide-react';

const DashboardCard = ({ title, value, description, icon, iconColor }: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
}) => (
  <Card className="dashboard-card">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`w-8 h-8 ${iconColor} rounded-md flex items-center justify-center`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

const RecentActivity = () => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
      <CardDescription>Latest updates from your dashboard</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[
          {
            title: "New contract created",
            description: "Contract #1234 with ABC Corp. was created",
            time: "1 hour ago",
            icon: <CreditCard className="h-4 w-4" />
          },
          {
            title: "Photos uploaded",
            description: "12 new photos uploaded for Hoarding #123",
            time: "3 hours ago",
            icon: <Camera className="h-4 w-4" />
          },
          {
            title: "Hoarding status updated",
            description: "Hoarding #45 status changed to Occupied",
            time: "5 hours ago",
            icon: <MapPin className="h-4 w-4" />
          },
          {
            title: "Payment received",
            description: "₹15,000 received from XYZ Corp.",
            time: "1 day ago",
            icon: <CreditCard className="h-4 w-4" />
          },
        ].map((activity, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="bg-muted rounded-full p-2">
              {activity.icon}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-xs text-muted-foreground">{activity.description}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const ContractRenewal = () => (
  <Card>
    <CardHeader>
      <CardTitle>Upcoming Renewals</CardTitle>
      <CardDescription>Contracts expiring in the next 30 days</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[
          {
            client: "ABC Corp.",
            hoardingId: "#123",
            location: "MG Road, Bangalore",
            expiryDate: "10 Jul 2023",
            daysLeft: 5
          },
          {
            client: "XYZ Ltd.",
            hoardingId: "#456",
            location: "Anna Salai, Chennai",
            expiryDate: "15 Jul 2023",
            daysLeft: 10
          },
          {
            client: "PQR Industries",
            hoardingId: "#789",
            location: "Linking Road, Mumbai",
            expiryDate: "28 Jul 2023",
            daysLeft: 23
          }
        ].map((contract, index) => (
          <div key={index} className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{contract.client}</p>
                <p className="text-xs text-muted-foreground">
                  {contract.hoardingId} - {contract.location}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs">Expires: {contract.expiryDate}</p>
                <p className={`text-xs font-medium ${
                  contract.daysLeft <= 7 ? 'text-destructive' : 'text-amber-500'
                }`}>
                  {contract.daysLeft} days left
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your hoarding management system.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="Total Hoardings" 
          value="48" 
          description="4 new this month"
          icon={<MapPin className="h-4 w-4 text-white" />}
          iconColor="bg-blue-500"
        />
        <DashboardCard 
          title="Active Campaigns" 
          value="32" 
          description="67% occupancy rate"
          icon={<BarChart3 className="h-4 w-4 text-white" />}
          iconColor="bg-green-500"
        />
        <DashboardCard 
          title="Total Clients" 
          value="18" 
          description="2 new this month"
          icon={<Users className="h-4 w-4 text-white" />}
          iconColor="bg-purple-500"
        />
        <DashboardCard 
          title="Monthly Revenue" 
          value="₹4.5L" 
          description="12% increase from last month"
          icon={<CreditCard className="h-4 w-4 text-white" />}
          iconColor="bg-amber-500"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <RecentActivity />
        <ContractRenewal />
      </div>
    </div>
  );
};

export default Dashboard;
