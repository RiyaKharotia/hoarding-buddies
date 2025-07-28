import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, ExternalLink, ImageOff, Calendar, Image, FileText, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { hoardingService, Hoarding } from "@/services/hoardingService";
import { format, addDays } from 'date-fns';
import { toast } from "sonner";

interface ClientHoarding {
  id: string;
  name: string;
  location: string;
  size: string;
  type: string;
  status: string;
  lastCaptured: string | null;
  contract: string;
  remainingDays: number;
}

const ClientHoardings: React.FC = () => {
  const [hoardings, setHoardings] = useState<ClientHoarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchHoardings();
  }, []);
  
  const fetchHoardings = async () => {
    try {
      setLoading(true);
      const response = await hoardingService.getAllHoardings();
      
      if (response.success && response.data) {
        let hoardingData: Hoarding[] = [];
        
        if (Array.isArray(response.data)) {
          hoardingData = response.data;
        } else if ('hoardings' in response.data) {
          hoardingData = response.data.hoardings;
        } else {
          hoardingData = [response.data as Hoarding];
        }
        
        const transformedData: ClientHoarding[] = hoardingData.map(hoarding => {
          const randomDays = Math.floor(Math.random() * 200) + 30;
          
          return {
            id: hoarding._id,
            name: hoarding.name,
            location: `${hoarding.location.address}, ${hoarding.location.city}`,
            size: `${hoarding.size.width}${hoarding.size.unit} x ${hoarding.size.height}${hoarding.size.unit}`,
            type: hoarding.size.width > 30 ? "Billboard" : hoarding.size.width > 20 ? "Digital Display" : "Unipole",
            status: hoarding.status,
            lastCaptured: hoarding.images && hoarding.images.length > 0 ? `${Math.floor(Math.random() * 10) + 1} days ago` : null,
            contract: `CON-2023-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
            remainingDays: randomDays
          };
        });
        
        setHoardings(transformedData);
      } else {
        console.info("No hoarding data from API, using mock data");
        setHoardings([
          {
            id: "H-001",
            name: "MG Road Billboard",
            location: "MG Road, Bangalore",
            size: "40ft x 20ft",
            type: "Billboard",
            status: "active",
            lastCaptured: "2 days ago",
            contract: "CON-2023-001",
            remainingDays: 120
          },
          {
            id: "H-002",
            name: "Indiranagar Display",
            location: "Indiranagar, Bangalore",
            size: "30ft x 15ft",
            type: "Digital Display",
            status: "active",
            lastCaptured: "5 days ago",
            contract: "CON-2023-001",
            remainingDays: 120
          },
          {
            id: "H-003",
            name: "Koramangala Unipole",
            location: "Koramangala, Bangalore",
            size: "20ft x 10ft",
            type: "Unipole",
            status: "active",
            lastCaptured: "1 week ago",
            contract: "CON-2023-002",
            remainingDays: 85
          },
          {
            id: "H-004",
            name: "Electronic City Billboard",
            location: "Electronic City, Bangalore",
            size: "40ft x 20ft",
            type: "Billboard",
            status: "pending",
            lastCaptured: null,
            contract: "CON-2023-003",
            remainingDays: 210
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch hoardings:", error);
      toast.error("Failed to load hoardings data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const filteredHoardings = hoardings.filter(hoarding => 
    hoarding.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hoarding.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hoarding.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-6">My Hoardings</h1>
        <p className="text-muted-foreground">
          View and manage your advertisement hoardings
        </p>
      </div>
      
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search hoardings..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Hoardings</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHoardings.map((hoarding) => (
              <Card key={hoarding.id}>
                <div className="aspect-video w-full bg-muted relative">
                  {hoarding.lastCaptured ? (
                    <img 
                      src={`https://source.unsplash.com/random/800x600?billboard&sig=${hoarding.id}`}
                      alt={hoarding.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                      <ImageOff className="h-10 w-10 mb-2" />
                      <p>No images yet</p>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge
                      className={getStatusColor(hoarding.status)}
                    >
                      {hoarding.status.charAt(0).toUpperCase() + hoarding.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle>{hoarding.name}</CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {hoarding.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Size</span>
                      <span>{hoarding.size}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Type</span>
                      <span>{hoarding.type}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Contract</span>
                      <span className="font-mono">{hoarding.contract}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Days Remaining</span>
                      <span>{hoarding.remainingDays} days</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      <Image className="mr-2 h-4 w-4" />
                      View Photos
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <FileText className="mr-2 h-4 w-4" />
                      Contract
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHoardings
              .filter(h => h.status === 'active')
              .map((hoarding) => (
                <Card key={hoarding.id}>
                  <div className="aspect-video w-full bg-muted relative">
                    <img 
                      src={`https://source.unsplash.com/random/800x600?billboard&sig=${hoarding.id}`}
                      alt={hoarding.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>{hoarding.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {hoarding.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Size</span>
                        <span>{hoarding.size}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Type</span>
                        <span>{hoarding.type}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Contract</span>
                        <span className="font-mono">{hoarding.contract}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Days Remaining</span>
                        <span>{hoarding.remainingDays} days</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1">
                        <Image className="mr-2 h-4 w-4" />
                        View Photos
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <FileText className="mr-2 h-4 w-4" />
                        Contract
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHoardings
              .filter(h => h.status === 'pending')
              .map((hoarding) => (
                <Card key={hoarding.id}>
                  <div className="aspect-video w-full bg-muted relative">
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                      <ImageOff className="h-10 w-10 mb-2" />
                      <p>No images yet</p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-amber-100 text-amber-800">
                        Pending
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>{hoarding.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {hoarding.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Size</span>
                        <span>{hoarding.size}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Type</span>
                        <span>{hoarding.type}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Contract</span>
                        <span className="font-mono">{hoarding.contract}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Days Remaining</span>
                        <span>{hoarding.remainingDays} days</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1">
                        <Calendar className="mr-2 h-4 w-4" />
                        Installation Date
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <FileText className="mr-2 h-4 w-4" />
                        Contract
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientHoardings;
