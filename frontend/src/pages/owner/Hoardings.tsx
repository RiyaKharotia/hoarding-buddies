import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Plus, Search, Filter, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hoardingService, Hoarding as HoardingType, HoardingResponseData } from "@/services/hoardingService";
import { HoardingStatus } from "@/utils/constants";

interface Hoarding {
  id: string;
  type: string;
  size: string;
  location: string;
  city: string;
  status: string;
  price: string;
  client?: string;
}

const Hoardings = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [hoardings, setHoardings] = useState<Hoarding[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentHoarding, setCurrentHoarding] = useState<Hoarding | null>(null);
  
  const [formData, setFormData] = useState({
    type: '',
    size: '',
    location: '',
    city: '',
    status: 'active',
    price: ''
  });

  // Fetch hoardings from API
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ['hoardings'],
    queryFn: async () => {
      const response = await hoardingService.getAllHoardings();
      return response;
    }
  });

  // Create hoarding mutation
  const createHoardingMutation = useMutation({
    mutationFn: (data: FormData) => hoardingService.createHoarding(data),
    onSuccess: () => {
      toast.success("Hoarding added successfully");
      queryClient.invalidateQueries({ queryKey: ['hoardings'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Failed to add hoarding:", error);
      toast.error("Failed to add hoarding. Please try again.");
    }
  });

  // Update hoarding mutation
  const updateHoardingMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => 
      hoardingService.updateHoarding(id, data),
    onSuccess: () => {
      toast.success("Hoarding updated successfully");
      queryClient.invalidateQueries({ queryKey: ['hoardings'] });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Failed to update hoarding:", error);
      toast.error("Failed to update hoarding. Please try again.");
    }
  });

  // Delete hoarding mutation
  const deleteHoardingMutation = useMutation({
    mutationFn: (id: string) => hoardingService.deleteHoarding(id),
    onSuccess: () => {
      toast.success("Hoarding deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['hoardings'] });
    },
    onError: (error) => {
      console.error("Failed to delete hoarding:", error);
      toast.error("Failed to delete hoarding. Please try again.");
    }
  });

  // Helper function to extract hoardings from different response formats
  const extractHoardings = (data: HoardingResponseData): HoardingType[] => {
    if (Array.isArray(data)) {
      return data;
    } else if ('hoardings' in data && Array.isArray(data.hoardings)) {
      return data.hoardings;
    } else {
      // Single hoarding object
      return [data as HoardingType];
    }
  };

  // Transform API data to our Hoarding interface
  useEffect(() => {
    if (apiResponse && apiResponse.data) {
      const hoardingsData = extractHoardings(apiResponse.data);
      
      const transformedData = hoardingsData.map((hoarding: HoardingType) => ({
        id: hoarding._id,
        type: hoarding.name.split(' at ')[0] || 'Billboard',
        size: `${hoarding.size.width}${hoarding.size.unit} x ${hoarding.size.height}${hoarding.size.unit}`,
        location: hoarding.location.address,
        city: hoarding.location.city,
        status: hoarding.status.charAt(0).toUpperCase() + hoarding.status.slice(1),
        price: `₹${hoarding.dailyRate * 30}/month`,
        client: undefined // This would need to be populated if you have client data
      }));
      
      setHoardings(transformedData);
    }
  }, [apiResponse]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddHoarding = () => {
    try {
      const sizeMatch = formData.size.match(/(\d+).*?x.*?(\d+)/);
      const width = sizeMatch ? parseInt(sizeMatch[1]) : 20;
      const height = sizeMatch ? parseInt(sizeMatch[2]) : 10;
      
      const priceValue = formData.price.replace(/[^\d]/g, '');
      const dailyRate = priceValue ? parseInt(priceValue) / 30 : 1500;
      
      const formDataObj = new FormData();
      formDataObj.append("name", `${formData.type} at ${formData.location}`);
      formDataObj.append("location[address]", formData.location);
      formDataObj.append("location[city]", formData.city);
      formDataObj.append("location[state]", "Karnataka");
      formDataObj.append("location[country]", "India");
      formDataObj.append("location[zipCode]", "560001");
      formDataObj.append("size[width]", width.toString());
      formDataObj.append("size[height]", height.toString());
      formDataObj.append("size[unit]", "ft");
      formDataObj.append("dailyRate", dailyRate.toString());
      formDataObj.append("status", formData.status.toLowerCase());

      createHoardingMutation.mutate(formDataObj);
    } catch (error) {
      console.error("Failed to prepare hoarding data:", error);
      toast.error("Failed to add hoarding. Please check your inputs.");
    }
  };

  const handleUpdateHoarding = () => {
    if (!currentHoarding) return;

    try {
      const sizeMatch = formData.size.match(/(\d+).*?x.*?(\d+)/);
      const width = sizeMatch ? parseInt(sizeMatch[1]) : 20;
      const height = sizeMatch ? parseInt(sizeMatch[2]) : 10;
      
      const priceValue = formData.price.replace(/[^\d]/g, '');
      const dailyRate = priceValue ? parseInt(priceValue) / 30 : 1500;
      
      const formDataObj = new FormData();
      formDataObj.append("name", `${formData.type} at ${formData.location}`);
      formDataObj.append("location[address]", formData.location);
      formDataObj.append("location[city]", formData.city);
      formDataObj.append("location[state]", "Karnataka");
      formDataObj.append("location[country]", "India");
      formDataObj.append("location[zipCode]", "560001");
      formDataObj.append("size[width]", width.toString());
      formDataObj.append("size[height]", height.toString());
      formDataObj.append("size[unit]", "ft");
      formDataObj.append("dailyRate", dailyRate.toString());
      formDataObj.append("status", formData.status.toLowerCase());

      updateHoardingMutation.mutate({ 
        id: currentHoarding.id, 
        data: formDataObj 
      });
    } catch (error) {
      console.error("Failed to prepare hoarding data:", error);
      toast.error("Failed to update hoarding. Please check your inputs.");
    }
  };

  const handleDeleteHoarding = (id: string) => {
    deleteHoardingMutation.mutate(id);
  };

  const handleEditClick = (hoarding: Hoarding) => {
    setCurrentHoarding(hoarding);
    setFormData({
      type: hoarding.type,
      size: hoarding.size,
      location: hoarding.location,
      city: hoarding.city,
      status: hoarding.status.toLowerCase(),
      price: hoarding.price
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      type: '',
      size: '',
      location: '',
      city: '',
      status: 'active',
      price: ''
    });
    setCurrentHoarding(null);
  };

  const filteredHoardings = hoardings.filter(hoarding => {
    const matchesSearch = 
      hoarding.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hoarding.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hoarding.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hoarding.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hoarding.client && hoarding.client.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || 
      hoarding.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const statusVariants: Record<string, string> = {
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-red-100 text-red-800',
    'Maintenance': 'bg-amber-100 text-amber-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hoardings</h2>
          <p className="text-muted-foreground">
            Manage your hoarding inventory and availability
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Hoarding
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Hoarding Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search hoardings..." 
                className="pl-10" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <span className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    {filterStatus === 'all' ? "All Status" : filterStatus}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}>
                Clear
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type & Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      Loading hoarding data...
                    </TableCell>
                  </TableRow>
                ) : filteredHoardings.length > 0 ? (
                  filteredHoardings.map((hoarding) => (
                    <TableRow key={hoarding.id}>
                      <TableCell className="font-medium">{hoarding.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div className="flex items-start gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                          <div>
                            <div>{hoarding.location}</div>
                            <div className="text-xs text-muted-foreground">{hoarding.city}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{hoarding.type}</div>
                        <div className="text-xs text-muted-foreground">{hoarding.size}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${statusVariants[hoarding.status]}`}>
                          {hoarding.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{hoarding.price}</TableCell>
                      <TableCell>{hoarding.client || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEditClick(hoarding)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleDeleteHoarding(hoarding.id)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No hoardings found matching your search criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Hoarding</DialogTitle>
            <DialogDescription>
              Enter the details of the new hoarding to add to your inventory.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Billboard">Billboard</SelectItem>
                  <SelectItem value="Digital Display">Digital Display</SelectItem>
                  <SelectItem value="Unipole">Unipole</SelectItem>
                  <SelectItem value="Transit">Transit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input 
                id="size" 
                placeholder="e.g. 40ft x 20ft" 
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                placeholder="Full address" 
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                placeholder="City" 
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="price">Monthly Price</Label>
              <Input 
                id="price" 
                placeholder="e.g. ₹45,000" 
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddHoarding}>
              Add Hoarding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Hoarding</DialogTitle>
            <DialogDescription>
              Update the details of this hoarding.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Billboard">Billboard</SelectItem>
                  <SelectItem value="Digital Display">Digital Display</SelectItem>
                  <SelectItem value="Unipole">Unipole</SelectItem>
                  <SelectItem value="Transit">Transit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-size">Size</Label>
              <Input 
                id="edit-size" 
                placeholder="e.g. 40ft x 20ft" 
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input 
                id="edit-location" 
                placeholder="Full address" 
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-city">City</Label>
              <Input 
                id="edit-city" 
                placeholder="City" 
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-price">Monthly Price</Label>
              <Input 
                id="edit-price" 
                placeholder="e.g. ₹45,000" 
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateHoarding}>
              Update Hoarding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Hoardings;
