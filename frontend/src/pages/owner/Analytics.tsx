
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Camera, Calendar, LineChart, MapPin, PieChart, TrendingUp, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Legend, 
  Line, 
  LineChart as RechartsLineChart, 
  Pie, 
  PieChart as RechartsPieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';

const Analytics: React.FC = () => {
  // Mock data for charts
  const monthlyRevenue = [
    { month: 'Jan', revenue: 120000 },
    { month: 'Feb', revenue: 150000 },
    { month: 'Mar', revenue: 160000 },
    { month: 'Apr', revenue: 170000 },
    { month: 'May', revenue: 180000 },
    { month: 'Jun', revenue: 190000 },
    { month: 'Jul', revenue: 195000 },
    { month: 'Aug', revenue: 200000 },
    { month: 'Sep', revenue: 210000 },
    { month: 'Oct', revenue: 220000 },
    { month: 'Nov', revenue: 230000 },
    { month: 'Dec', revenue: 250000 },
  ];

  const hoardingsByLocation = [
    { name: 'Bangalore', value: 35 },
    { name: 'Mumbai', value: 25 },
    { name: 'Delhi', value: 20 },
    { name: 'Hyderabad', value: 15 },
    { name: 'Chennai', value: 10 },
  ];

  const photographerPerformance = [
    { name: 'Alex', uploads: 180, quality: 4.8 },
    { name: 'Sarah', uploads: 245, quality: 4.5 },
    { name: 'David', uploads: 102, quality: 4.9 },
    { name: 'Priya', uploads: 178, quality: 4.7 },
  ];

  const clientDistribution = [
    { name: 'Supernova Ads', value: 30 },
    { name: 'Vision Media', value: 25 },
    { name: 'Spark Promo', value: 15 },
    { name: 'Metro Display', value: 20 },
    { name: 'Fusion Brands', value: 10 },
  ];

  // Colors for charts
  const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'];
  
  // Format number with commas
  const formatNumber = (num: number) => {
    return "₹" + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        <Select defaultValue="year">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Hoardings</CardTitle>
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">105</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 12%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 5%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
              <Camera className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,892</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 18%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <div className="w-8 h-8 bg-amber-500 rounded-md flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹22,75,000</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 8%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">
            <LineChart className="mr-2 h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="hoardings">
            <BarChart3 className="mr-2 h-4 w-4" />
            Hoardings
          </TabsTrigger>
          <TabsTrigger value="clients">
            <PieChart className="mr-2 h-4 w-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="photographers">
            <Camera className="mr-2 h-4 w-4" />
            Photographers
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Revenue breakdown for the past 12 months</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={monthlyRevenue}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                  <Tooltip formatter={(value) => formatNumber(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} name="Revenue" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hoardings" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hoardings by Location</CardTitle>
              <CardDescription>Distribution of hoardings across cities</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hoardingsByLocation}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Number of Hoardings">
                    {hoardingsByLocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clients" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Distribution</CardTitle>
              <CardDescription>Breakdown of revenue by major clients</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={clientDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {clientDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} hoardings`, "Count"]} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="photographers" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Photographer Performance</CardTitle>
              <CardDescription>Photo uploads and quality ratings by photographer</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={photographerPerformance}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="uploads" fill="#8884d8" name="Total Uploads" />
                  <Bar yAxisId="right" dataKey="quality" fill="#82ca9d" name="Quality Score (out of 5)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
