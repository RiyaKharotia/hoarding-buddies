
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, MapPin, Phone, Mail, CreditCard, FileText } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { clientService } from '@/services/clientService';
import api from '@/services/api';

// Use the Client type from the service to avoid conflicts
import type { Client } from '@/services/clientService';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    location: '',
    address: ''
  });

  // Load clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Fetch clients from API
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await clientService.getAllClients();
      
      if (response && response.data) {
        // Check if data is an array or an object with clients property
        const clientsArray = Array.isArray(response.data) 
          ? response.data 
          : ('clients' in response.data ? response.data.clients : []);
        
        // Process each client to ensure we have proper values
        const processedClients = clientsArray.map(client => {
          // Handle the case where client might be nested inside a uid property
          const clientData = client.uid ? { ...client.uid, ...client } : client;
          
          return {
            ...clientData,
            name: clientData.name || clientData.companyName || 'Unnamed Client',
            email: clientData.email || 'No email provided',
            phone: clientData.phone || 'No phone provided',
            location: clientData.location || 'No location provided',
            contactPerson: clientData.contactPerson || 'No contact person',
            status: clientData.status || 'active',
            hoardingsCount: clientData.hoardingsCount || 0,
            contractsCount: clientData.contractsCount || 0,
          };
        });
        
        setClients(processedClients as Client[]);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      toast.error("Failed to fetch clients. Using mock data.");
    } finally {
      setLoading(false);
    }
  };

  // Handle input change for form fields
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new client
  const handleAddClient = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        address: formData.address,
        contactPerson: formData.contactPerson,
        role: 'client',
        password: 'tempPassword123' // This would normally be generated or requested
      };

      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success("Client added successfully");
        setIsAddDialogOpen(false);
        resetForm();
        fetchClients();
      } else {
        throw new Error('Failed to add client');
      }
    } catch (error) {
      console.error("Failed to add client:", error);
      toast.error("Failed to add client. Please try again.");
    }
  };

  // Reset form state
  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      location: '',
      address: ''
    });
  };

  // View client details
  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setIsViewDialogOpen(true);
  };

  // Navigate to contracts page for creating a new contract for the client
  const handleCreateContract = (clientId: string) => {
    navigate('/contracts', { state: { createFor: clientId } });
  };

  // Filter clients based on search term
  const filteredClients = clients.filter(client => {
    const name = client?.name?.toLowerCase() || '';
    const contactPerson = client?.contactPerson?.toLowerCase() || '';
    const email = client?.email?.toLowerCase() || '';
    const location = client?.location?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    return (
      name.includes(searchLower) ||
      contactPerson.includes(searchLower) ||
      email.includes(searchLower) ||
      location.includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">Clients Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <Input
          placeholder="Search clients..."
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Clients</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {loading ? (
            <div className="flex justify-center p-10">Loading clients...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <Card key={client._id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <CardTitle className="text-xl">{client.name}</CardTitle>
                          <CardDescription>{client.contactPerson}</CardDescription>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {client.status === 'active' ? 'Active' : 'Inactive'}
                          </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{client.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{client.phone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{client.location}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-muted rounded p-3 flex flex-col">
                          <span className="text-xs text-muted-foreground">Hoardings</span>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-brand-blue" />
                            <span className="font-medium">{client.hoardingsCount}</span>
                          </div>
                        </div>
                        <div className="bg-muted rounded p-3 flex flex-col">
                          <span className="text-xs text-muted-foreground">Contracts</span>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1 text-brand-blue" />
                            <span className="font-medium">{client.contractsCount}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleCreateContract(client._id)}
                          disabled={client.status !== 'active'}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Contracts
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewDetails(client)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  No clients found. Try adjusting your search criteria.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClients
              .filter(c => c.status === 'active')
              .map((client) => (
                <Card key={client._id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <CardTitle className="text-xl">{client.name}</CardTitle>
                        <CardDescription>{client.contactPerson}</CardDescription>
                      </div>
                      <div className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Active
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{client.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{client.location}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-muted rounded p-3 flex flex-col">
                        <span className="text-xs text-muted-foreground">Hoardings</span>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-brand-blue" />
                          <span className="font-medium">{client.hoardingsCount}</span>
                        </div>
                      </div>
                      <div className="bg-muted rounded p-3 flex flex-col">
                        <span className="text-xs text-muted-foreground">Contracts</span>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1 text-brand-blue" />
                          <span className="font-medium">{client.contractsCount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleCreateContract(client._id)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Contracts
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewDetails(client)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClients
              .filter(c => c.status === 'inactive')
              .map((client) => (
                <Card key={client._id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <CardTitle className="text-xl">{client.name}</CardTitle>
                        <CardDescription>{client.contactPerson}</CardDescription>
                      </div>
                      <div className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                        Inactive
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{client.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{client.location}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-muted rounded p-3 flex flex-col">
                        <span className="text-xs text-muted-foreground">Hoardings</span>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-brand-blue" />
                          <span className="font-medium">{client.hoardingsCount}</span>
                        </div>
                      </div>
                      <div className="bg-muted rounded p-3 flex flex-col">
                        <span className="text-xs text-muted-foreground">Contracts</span>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1 text-brand-blue" />
                          <span className="font-medium">{client.contractsCount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={async () => {
                          try {
                            await api.put(`/api/users/${client._id}`, { status: 'active' });
                            toast.success(`${client.name} activated successfully`);
                            fetchClients();
                          } catch (error) {
                            toast.error("Failed to activate client");
                          }
                        }}
                      >
                        Activate
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewDetails(client)}
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

      {/* Add Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Enter client details to add them to your system
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                placeholder="ABC Corporation"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                placeholder="John Doe"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@abccorp.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
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
              <Label htmlFor="location">City</Label>
              <Input
                id="location"
                placeholder="City"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Textarea
                id="address"
                placeholder="Street, Area, City, Pincode"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
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
            <Button onClick={handleAddClient}>
              Add Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Client Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>
              {selectedClient && `Detailed information about ${selectedClient.name}`}
            </DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedClient.name}</h3>
                  <p className={`text-sm ${selectedClient.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                    {selectedClient.status === 'active' ? 'Active' : 'Inactive'} Client
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="font-medium">{selectedClient.contactPerson}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{selectedClient.email}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{selectedClient.phone}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedClient.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Hoardings</h4>
                  <div className="bg-muted p-3 rounded">
                    <div className="flex justify-between">
                      <span>{selectedClient.hoardingsCount} hoardings</span>
                      {selectedClient.hoardingsCount > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-auto p-0 text-primary"
                          onClick={() => {
                            navigate('/hoardings', { state: { clientFilter: selectedClient._id } });
                          }}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Contracts</h4>
                  <div className="bg-muted p-3 rounded">
                    <div className="flex justify-between">
                      <span>{selectedClient.contractsCount} contracts</span>
                      {selectedClient.contractsCount > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-auto p-0 text-primary"
                          onClick={() => {
                            navigate('/contracts', { state: { clientFilter: selectedClient._id } });
                          }}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                {selectedClient.status === 'active' ? (
                  <Button
                    variant="outline"
                    className="flex-1 border-amber-500 text-amber-700 hover:bg-amber-50"
                    onClick={async () => {
                      try {
                        await api.put(`/api/users/${selectedClient._id}`, { status: 'inactive' });
                        toast.success(`${selectedClient.name} deactivated successfully`);
                        setIsViewDialogOpen(false);
                        fetchClients();
                      } catch (error) {
                        toast.error("Failed to deactivate client");
                      }
                    }}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1 border-green-500 text-green-700 hover:bg-green-50"
                    onClick={async () => {
                      try {
                        await api.put(`/api/users/${selectedClient._id}`, { status: 'active' });
                        toast.success(`${selectedClient.name} activated successfully`);
                        setIsViewDialogOpen(false);
                        fetchClients();
                      } catch (error) {
                        toast.error("Failed to activate client");
                      }
                    }}
                  >
                    Activate
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleCreateContract(selectedClient._id);
                  }}
                  className="flex-1"
                  disabled={selectedClient.status !== 'active'}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Create Contract
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
