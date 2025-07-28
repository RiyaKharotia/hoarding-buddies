
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Calendar, MapPin, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Client Dashboard</h2>
        <p className="text-muted-foreground">
          View your hoarding details and advertisement campaigns
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Hoardings</CardTitle>
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">Across 3 cities</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Campaign Days Left</CardTitle>
            <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground mt-1">Until next renewal</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
              <Image className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-muted-foreground mt-1">12 new this month</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <div className="w-8 h-8 bg-amber-500 rounded-md flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹12,500</div>
            <p className="text-xs text-muted-foreground mt-1">Next payment: 15 Jul</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>My Hoardings</span>
              <Button size="sm" onClick={() => navigate('/client/hoardings')}>View All</Button>
            </CardTitle>
            <CardDescription>Your active hoarding campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  location: "MG Road, Bangalore",
                  size: "40ft x 20ft",
                  startsAt: "01 May 2023",
                  endsAt: "31 Jul 2023",
                  status: "Active"
                },
                {
                  id: 2,
                  location: "Anna Salai, Chennai",
                  size: "30ft x 15ft",
                  startsAt: "15 Jun 2023",
                  endsAt: "14 Aug 2023",
                  status: "Active"
                },
                {
                  id: 3,
                  location: "Linking Road, Mumbai",
                  size: "45ft x 25ft",
                  startsAt: "01 Jul 2023",
                  endsAt: "30 Sep 2023",
                  status: "Active"
                }
              ].map((hoarding) => (
                <div key={hoarding.id} className="bg-muted/50 rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{hoarding.location}</h4>
                      <p className="text-xs text-muted-foreground">Size: {hoarding.size}</p>
                      <p className="text-xs text-muted-foreground">
                        {hoarding.startsAt} to {hoarding.endsAt}
                      </p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {hoarding.status}
                    </div>
                  </div>
                  <div className="mt-2 flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => navigate(`/client/photos?hoarding=${hoarding.id}`)}
                    >
                      <Image className="mr-1 h-3 w-3" />
                      View Photos
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => navigate(`/client/contracts?hoarding=${hoarding.id}`)}
                    >
                      <Calendar className="mr-1 h-3 w-3" />
                      Contract
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Recent Photos</span>
              <Button size="sm" onClick={() => navigate('/client/photos')}>View All</Button>
            </CardTitle>
            <CardDescription>Latest photos of your hoardings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((id) => (
                <div key={id} className="aspect-square rounded-md bg-muted overflow-hidden relative">
                  <img 
                    src={`https://source.unsplash.com/random/300x300?billboard&sig=${id + 10}`} 
                    alt="Billboard" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                    <p className="text-[10px] text-white truncate">
                      {id % 3 === 0 ? "MG Road" : id % 3 === 1 ? "Anna Salai" : "Linking Road"}
                    </p>
                    <p className="text-[8px] text-gray-300">
                      {`${Math.floor(Math.random() * 20) + 1} days ago`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-brand-blue/10 border-brand-blue">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between p-6">
          <div className="mb-4 sm:mb-0">
            <h3 className="font-semibold text-lg">Contract Renewal</h3>
            <p className="text-sm text-muted-foreground">
              Your campaign on MG Road expires in 15 days. Renew now to maintain your spot.
            </p>
          </div>
          <Button onClick={() => navigate('/client/contracts')}>
            Renew Contract
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;
