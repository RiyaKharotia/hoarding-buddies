
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, UserPlus, Map, Phone, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { photographerService, Photographer } from "@/services/photographerService";
import { hoardingService } from "@/services/hoardingService";
import api from '@/services/api';

import type { Hoarding } from '@/services/hoardingService';

const Photographers: React.FC = () => {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPhotographer, setSelectedPhotographer] = useState<Photographer | null>(null);
  const [availableHoardings, setAvailableHoardings] = useState<Hoarding[]>([]);
  const [selectedHoardingId, setSelectedHoardingId] = useState('');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    avatar: null as File | null
  });

  useEffect(() => {
    fetchPhotographers();
  }, []);

  const fetchPhotographers = async () => {
    setLoading(true);
    try {
      const response = await photographerService.getAllPhotographers();
      
      if (response && response.data) {
        console.log("Photographers data:", response.data);
        setPhotographers(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch photographers:", error);
      toast.error("Failed to fetch photographers. Using mock data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableHoardings = async () => {
    try {
      const response = await hoardingService.getAllHoardings({ status: 'active' });
      
      if (response && response.data) {
        const hoardingsArray = Array.isArray(response.data) 
          ? response.data 
          : ('hoardings' in response.data ? response.data.hoardings : []);
        
        setAvailableHoardings(hoardingsArray);
      }
    } catch (error) {
      console.error("Failed to fetch hoardings:", error);
      toast.error("Failed to fetch available hoardings. Using mock data.");
      
      setAvailableHoardings([
        { 
          _id: 'H001', 
          name: 'MG Road Billboard', 
          location: { address: 'MG Road Junction', city: 'Bangalore', state: '', country: '', zipCode: '' },
          size: { width: 0, height: 0, unit: '' },
          dailyRate: 0,
          status: 'active',
          images: [],
          owner: '',
          createdAt: '',
          updatedAt: ''
        },
        { 
          _id: 'H002', 
          name: 'Airport Digital Display', 
          location: { address: 'Airport Road', city: 'Bangalore', state: '', country: '', zipCode: '' },
          size: { width: 0, height: 0, unit: '' },
          dailyRate: 0,
          status: 'active',
          images: [],
          owner: '',
          createdAt: '',
          updatedAt: ''
        },
        { 
          _id: 'H003', 
          name: 'Central Mall Unipole', 
          location: { address: 'Central Mall', city: 'Mumbai', state: '', country: '', zipCode: '' },
          size: { width: 0, height: 0, unit: '' },
          dailyRate: 0,
          status: 'active',
          images: [],
          owner: '',
          createdAt: '',
          updatedAt: ''
        }
      ]);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        avatar: e.target.files![0]
      }));
    }
  };

  const handleAddPhotographer = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('role', 'photographer');

      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }

      const response = await fetch('/api/users/register', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Photographer added successfully");
        setIsAddDialogOpen(false);
        resetForm();
        fetchPhotographers();
      } else {
        throw new Error('Failed to add photographer');
      }
    } catch (error) {
      console.error("Failed to add photographer:", error);
      toast.error("Failed to add photographer. Please try again.");
    }
  };

  const handleAssignHoarding = async () => {
    if (!selectedPhotographer || !selectedHoardingId) {
      toast.error("Please select both photographer and hoarding");
      return;
    }

    try {
      const photographerId = selectedPhotographer._id;
      
      console.log("Selected photographer:", selectedPhotographer);
      console.log("Using photographer ID for assignment:", photographerId);
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      const formattedDueDate = dueDate.toISOString().split('T')[0];
      
      const response = await photographerService.assignHoarding(
        photographerId,
        selectedHoardingId,
        formattedDueDate
      );

      toast.success(`Hoarding assigned to ${selectedPhotographer.name || 'photographer'} successfully`);
      setIsAssignDialogOpen(false);
      setSelectedHoardingId('');
      fetchPhotographers();
    } catch (error) {
      console.error("Failed to assign hoarding:", error);
      toast.error("Failed to assign hoarding. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      location: '',
      password: '',
      avatar: null
    });
  };

  const handleOpenAssignDialog = (photographer: Photographer) => {
    setSelectedPhotographer(photographer);
    fetchAvailableHoardings();
    setIsAssignDialogOpen(true);
  };

  const handleViewDetails = (photographer: Photographer) => {
    setSelectedPhotographer(photographer);
    setIsViewDialogOpen(true);
  };

  const filteredPhotographers = photographers.filter(photographer => {
    // Handle both direct properties and nested uid properties
    const name = photographer?.name || photographer?.uid?.name || '';
    const email = photographer?.email || photographer?.uid?.email || '';
    const location = photographer?.location || photographer?.uid?.location || '';
    const searchLower = searchTerm.toLowerCase();
    
    return (
      name.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      location.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">Photographers Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Photographer
        </Button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <Input
          placeholder="Search photographers..."
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Photographers</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {loading ? (
            <div className="flex justify-center p-10">Loading photographers...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPhotographers.length > 0 ? (
                filteredPhotographers.map((photographer) => (
                  <Card key={photographer._id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <CardTitle className="text-xl">{photographer.name || photographer.uid?.name || 'Unknown'}</CardTitle>
                          <CardDescription>{photographer.location || photographer.uid?.location || 'No location'}</CardDescription>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${photographer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {photographer.status === 'active' ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{photographer.email || photographer.uid?.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{photographer.phone || photographer.uid?.phone || 'No phone'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Map className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{photographer.assignedHoardings || 0} assigned hoardings</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Camera className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{photographer.photosUploaded || 0} photos uploaded</span>
                      </div>
                      <div className="flex space-x-2 pt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleOpenAssignDialog(photographer)}
                          disabled={photographer.status !== 'active'}
                        >
                          Assign
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewDetails(photographer)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  No photographers found. Try adjusting your search criteria.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPhotographers
              .filter(p => p.status === 'active')
              .map((photographer) => (
                <Card key={photographer._id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <CardTitle className="text-xl">{photographer.name || photographer.uid?.name || 'Unknown'}</CardTitle>
                        <CardDescription>{photographer.location || photographer.uid?.location || 'No location'}</CardDescription>
                      </div>
                      <div className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Active
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{photographer.email || photographer.uid?.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{photographer.phone || photographer.uid?.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Map className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{photographer.assignedHoardings || 0} assigned hoardings</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Camera className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{photographer.photosUploaded || 0} photos uploaded</span>
                    </div>
                    <div className="flex space-x-2 pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleOpenAssignDialog(photographer)}
                      >
                        Assign
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewDetails(photographer)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPhotographers
              .filter(p => p.status === 'inactive')
              .map((photographer) => (
                <Card key={photographer._id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <CardTitle className="text-xl">{photographer.name || photographer.uid?.name || 'Unknown'}</CardTitle>
                        <CardDescription>{photographer.location || photographer.uid?.location || 'No location'}</CardDescription>
                      </div>
                      <div className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                        Inactive
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{photographer.email || photographer.uid?.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{photographer.phone || photographer.uid?.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Map className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{photographer.assignedHoardings || 0} assigned hoardings</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Camera className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{photographer.photosUploaded || 0} photos uploaded</span>
                    </div>
                    <div className="flex space-x-2 pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={async () => {
                          try {
                            await api.put(`/api/users/${photographer._id}`, { status: 'active' });
                            toast.success(`${photographer.name || 'Photographer'} activated successfully`);
                            fetchPhotographers();
                          } catch (error) {
                            toast.error("Failed to activate photographer");
                          }
                        }}
                      >
                        Activate
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewDetails(photographer)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Photographer</DialogTitle>
            <DialogDescription>
              Enter details to add a new photographer to your team
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+91 12345-67890"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Profile Picture</Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
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
            <Button onClick={handleAddPhotographer}>
              Add Photographer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Hoarding</DialogTitle>
            <DialogDescription>
              {selectedPhotographer && `Assign a hoarding to ${selectedPhotographer.name || selectedPhotographer.uid?.name || 'the photographer'}`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="hoarding">Select Hoarding</Label>
              <Select value={selectedHoardingId} onValueChange={setSelectedHoardingId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a hoarding" />
                </SelectTrigger>
                <SelectContent>
                  {availableHoardings.length > 0 ? (
                    availableHoardings.map(hoarding => (
                      <SelectItem key={hoarding._id} value={hoarding._id}>
                        {hoarding.name} - {hoarding.location?.city || 'No city'}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-hoarding" disabled>No hoardings available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAssignDialogOpen(false);
              setSelectedHoardingId('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleAssignHoarding}>
              Assign Hoarding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Photographer Details</DialogTitle>
            <DialogDescription>
              {selectedPhotographer && `Detailed information about ${selectedPhotographer.name || 'this photographer'}`}
            </DialogDescription>
          </DialogHeader>

          {selectedPhotographer && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {selectedPhotographer.avatar ? (
                    <img
                      src={selectedPhotographer.avatar}
                      alt={selectedPhotographer.name || 'Photographer'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{selectedPhotographer.name ? selectedPhotographer.name.charAt(0) : 'P'}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedPhotographer.name || 'Unnamed Photographer'}</h3>
                  <p className={`text-sm ${selectedPhotographer.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                    {selectedPhotographer.status === 'active' ? 'Active' : 'Inactive'} Photographer
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{selectedPhotographer.email || selectedPhotographer.uid?.email || 'No email'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{selectedPhotographer.phone || selectedPhotographer.uid?.phone || 'No phone'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedPhotographer.location || selectedPhotographer.uid?.location || 'No location'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Photos Uploaded</p>
                  <p className="font-medium">{selectedPhotographer.photosUploaded || 0}</p>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <h4 className="font-medium">Assigned Hoardings</h4>
                {selectedPhotographer.assignedHoardings > 0 ? (
                  <div className="bg-muted p-3 rounded">
                    <p>{selectedPhotographer.assignedHoardings} hoardings currently assigned</p>
                    <Button
                      size="sm"
                      className="mt-2"
                      variant="outline"
                      onClick={async () => {
                        try {
                          const response = await api.get(`/api/assignments?photographerId=${selectedPhotographer._id}`);
                          if (response.status === 200) {
                            const data = response.data;
                            toast.success(`Found ${data?.data?.length || 0} assignments`);
                          } else {
                            throw new Error('Failed to fetch assignments');
                          }
                        } catch (error) {
                          toast.error("Failed to fetch assignments");
                        }
                      }}
                    >
                      View Assignments
                    </Button>
                  </div>
                ) : (
                  <div className="bg-muted p-3 rounded">
                    <p>No hoardings currently assigned</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-4">
                {selectedPhotographer.status === 'active' ? (
                  <Button
                    variant="outline"
                    className="flex-1 border-amber-500 text-amber-700 hover:bg-amber-50"
                    onClick={async () => {
                      try {
                        await api.put(`/api/users/${selectedPhotographer._id}`, { status: 'inactive' });
                        toast.success(`${selectedPhotographer.name || 'Photographer'} deactivated successfully`);
                        setIsViewDialogOpen(false);
                        fetchPhotographers();
                      } catch (error) {
                        toast.error("Failed to deactivate photographer");
                      }
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1 border-green-500 text-green-700 hover:bg-green-50"
                    onClick={async () => {
                      try {
                        await api.put(`/api/users/${selectedPhotographer._id}`, { status: 'active' });
                        toast.success(`${selectedPhotographer.name || 'Photographer'} activated successfully`);
                        setIsViewDialogOpen(false);
                        fetchPhotographers();
                      } catch (error) {
                        toast.error("Failed to activate photographer");
                      }
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Activate
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    if (selectedPhotographer.status === 'active') {
                      handleOpenAssignDialog(selectedPhotographer);
                    }
                  }}
                  className="flex-1"
                  disabled={selectedPhotographer.status !== 'active'}
                >
                  Assign Hoarding
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Photographers;
