import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, CreditCard, Download, FileText, Plus, Search, XCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import api from "@/services/api";
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ContractStatus, PaymentStatus } from "../../utils/constants";

interface Contract {
  id: string;
  client: string;
  clientId: string;
  startDate: string;
  endDate: string;
  value: string;
  hoardingsCount: number;
  status: string;
  paymentStatus: string;
}

interface Client {
  id: string;
  name: string;
}

interface Hoarding {
  id: string;
  name: string;
  location: string;
  dailyRate: number;
}

const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [availableHoardings, setAvailableHoardings] = useState<Hoarding[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    clientId: '',
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    selectedHoardings: [] as string[],
    contractValue: '',
  });

  useEffect(() => {
    if (location.state?.clientFilter) {
      const clientId = location.state.clientFilter;
      setFormData(prev => ({ ...prev, clientId }));
      
      if (location.state?.createFor) {
        setFormData(prev => ({ ...prev, clientId: location.state.createFor }));
        setIsAddDialogOpen(true);
      }
    }
  }, [location.state]);

  useEffect(() => {
    fetchContracts();
    fetchClients();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/contracts');
      
      if (response.data && response.data.data) {
        const transformedData = response.data.data.map((contract: any) => ({
          id: contract._id,
          client: contract.client?.name || 'Unknown Client',
          clientId: contract.client?._id,
          startDate: format(new Date(contract.startDate), 'dd/MM/yyyy'),
          endDate: format(new Date(contract.endDate), 'dd/MM/yyyy'),
          value: `₹${contract.totalAmount.toLocaleString()}`,
          hoardingsCount: contract.hoardings?.length || 0,
          status: contract.status,
          paymentStatus: contract.paymentStatus || 'pending'
        }));
        setContracts(transformedData);
      } else {
        setContracts(mockContracts);
      }
    } catch (error) {
      console.error("Failed to fetch contracts:", error);
      setContracts(mockContracts);
      toast.error("Failed to fetch contracts. Using mock data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/api/users', {
        params: { role: 'client' }
      });
      
      if (response.data && response.data.data) {
        const clientData = response.data.data.map((client: any) => ({
          id: client._id,
          name: client.companyName || client.name
        }));
        setClients(clientData);
      } else {
        setClients([]);
        console.warn("No client data returned from API");
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      setClients([]);
    }
  };

  const fetchAvailableHoardings = async () => {
    try {
      const response = await api.get('/api/hoardings', {
        params: { status: 'Available' }
      });
      
      if (response.data && response.data.data) {
        const hoardingData = response.data.data.map((hoarding: any) => ({
          id: hoarding._id,
          name: hoarding.name,
          location: `${hoarding.location.address}, ${hoarding.location.city}`,
          dailyRate: hoarding.dailyRate
        }));
        setAvailableHoardings(hoardingData);
      }
    } catch (error) {
      console.error("Failed to fetch hoardings:", error);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'clientId') {
      setFormData(prev => ({ ...prev, selectedHoardings: [] }));
    }
    
    if (field === 'selectedHoardings' || field === 'startDate' || field === 'endDate') {
      calculateContractValue();
    }
  };

  const calculateContractValue = () => {
    if (formData.selectedHoardings.length === 0 || !formData.startDate || !formData.endDate) {
      setFormData(prev => ({ ...prev, contractValue: '' }));
      return;
    }
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    
    let totalCost = 0;
    formData.selectedHoardings.forEach(hoardingId => {
      const hoarding = availableHoardings.find(h => h.id === hoardingId);
      if (hoarding) {
        totalCost += hoarding.dailyRate * days;
      }
    });
    
    setFormData(prev => ({ ...prev, contractValue: totalCost.toLocaleString() }));
  };

  const handleAddContract = async () => {
    try {
      const payload = {
        clientId: formData.clientId,
        startDate: format(new Date(formData.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(formData.endDate), 'yyyy-MM-dd'),
        hoardings: formData.selectedHoardings,
        status: ContractStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING
      };

      const response = await api.post('/api/contracts', payload);
      
      if (response.data && response.data.data) {
        toast.success("Contract created successfully");
        setIsAddDialogOpen(false);
        resetForm();
        fetchContracts();
      }
    } catch (error) {
      console.error("Failed to create contract:", error);
      toast.error("Failed to create contract. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      selectedHoardings: [],
      contractValue: '',
    });
  };

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsViewDialogOpen(true);
  };

  const handleDownloadContract = async (contractId: string) => {
    try {
      const response = await api.get(`/api/contracts/${contractId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contract-${contractId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Contract downloaded successfully");
    } catch (error) {
      console.error("Failed to download contract:", error);
      toast.error("Failed to download contract. Please try again.");
    }
  };

  const handleCreateInvoice = async (contractId: string) => {
    try {
      const response = await api.post(`/api/billings/invoice`, {
        contractId
      });
      
      if (response.data && response.data.data) {
        toast.success("Invoice generated successfully");
        navigate('/billings');
      }
    } catch (error) {
      console.error("Failed to create invoice:", error);
      toast.error("Failed to generate invoice. Please try again.");
    }
  };

  const handleUpdateContractStatus = async (contractId: string, status: string) => {
    try {
      await api.put(`/api/contracts/${contractId}`, {
        status
      });
      
      toast.success(`Contract marked as ${status.toLowerCase()}`);
      fetchContracts();
    } catch (error) {
      console.error("Failed to update contract:", error);
      toast.error("Failed to update contract status. Please try again.");
    }
  };

  const filteredContracts = contracts.filter(contract => {
    return (
      contract.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.client.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status) {
      case ContractStatus.ACTIVE:
        return "bg-green-100 text-green-800";
      case ContractStatus.PENDING:
        return "bg-amber-100 text-amber-800";
      case ContractStatus.COMPLETED:
        return "bg-blue-100 text-blue-800";
      case ContractStatus.CANCELLED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status) {
      case PaymentStatus.PAID:
        return "bg-emerald-100 text-emerald-800";
      case PaymentStatus.PENDING:
        return "bg-blue-100 text-blue-800";
      case PaymentStatus.OVERDUE:
        return "bg-red-100 text-red-800";
      case PaymentStatus.CANCELLED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string | undefined) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const mockContracts: Contract[] = [
    {
      id: "CON-2023-001",
      client: "Supernova Advertising",
      clientId: "client-1",
      startDate: "01/01/2023",
      endDate: "31/03/2023",
      value: "₹80,000",
      hoardingsCount: 2,
      status: "completed",
      paymentStatus: "paid"
    },
    {
      id: "CON-2023-002",
      client: "Vision Media Group",
      clientId: "client-2",
      startDate: "01/03/2023",
      endDate: "31/08/2023",
      value: "₹140,000",
      hoardingsCount: 3,
      status: "active",
      paymentStatus: "paid"
    },
    {
      id: "CON-2023-003",
      client: "Spark Promotions",
      clientId: "client-3",
      startDate: "15/04/2023",
      endDate: "15/07/2023",
      value: "₹45,000",
      hoardingsCount: 1,
      status: "active",
      paymentStatus: "pending"
    },
    {
      id: "CON-2023-004",
      client: "Metro Displays",
      clientId: "client-4",
      startDate: "01/06/2023",
      endDate: "31/05/2024",
      value: "₹175,000",
      hoardingsCount: 4,
      status: "pending",
      paymentStatus: "pending"
    },
    {
      id: "CON-2023-005",
      client: "Fusion Brands",
      clientId: "client-5",
      startDate: "01/07/2023",
      endDate: "31/12/2023",
      value: "₹120,000",
      hoardingsCount: 2,
      status: "active",
      paymentStatus: "pending"
    }
  ];

  const handleOpenAddDialog = () => {
    fetchAvailableHoardings();
    fetchClients();
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">Contracts Management</h1>
        <Button onClick={handleOpenAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Contract
        </Button>
      </div>
      
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search contracts..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Contracts</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Hoardings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        Loading contracts...
                      </TableCell>
                    </TableRow>
                  ) : filteredContracts.length > 0 ? (
                    filteredContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.id}</TableCell>
                        <TableCell>{contract.client}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">From</span>
                            <span>{contract.startDate}</span>
                            <span className="text-xs text-muted-foreground mt-1">To</span>
                            <span>{contract.endDate}</span>
                          </div>
                        </TableCell>
                        <TableCell>{contract.value}</TableCell>
                        <TableCell>{contract.hoardingsCount}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(contract.status)}`}>
                            {formatStatus(contract.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(contract.paymentStatus)}`}>
                            {formatStatus(contract.paymentStatus)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewContract(contract)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadContract(contract.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {contract.status === ContractStatus.PENDING && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-green-50 text-green-700 hover:bg-green-100"
                                onClick={() => handleUpdateContractStatus(contract.id, ContractStatus.ACTIVE)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {contract.paymentStatus === PaymentStatus.PENDING && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                                onClick={() => handleCreateInvoice(contract.id)}
                              >
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        No contracts found matching your search criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Hoardings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts
                    .filter(c => c.status === ContractStatus.ACTIVE)
                    .map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.id}</TableCell>
                      <TableCell>{contract.client}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">From</span>
                          <span>{contract.startDate}</span>
                          <span className="text-xs text-muted-foreground mt-1">To</span>
                          <span>{contract.endDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>{contract.value}</TableCell>
                      <TableCell>{contract.hoardingsCount}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Active
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(contract.paymentStatus)}`}>
                          {formatStatus(contract.paymentStatus)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewContract(contract)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadContract(contract.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {contract.paymentStatus === PaymentStatus.PENDING && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                              onClick={() => handleCreateInvoice(contract.id)}
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Hoardings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts
                    .filter(c => c.status === ContractStatus.PENDING)
                    .map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.id}</TableCell>
                      <TableCell>{contract.client}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">From</span>
                          <span>{contract.startDate}</span>
                          <span className="text-xs text-muted-foreground mt-1">To</span>
                          <span>{contract.endDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>{contract.value}</TableCell>
                      <TableCell>{contract.hoardingsCount}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                          Pending
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(contract.paymentStatus)}`}>
                          {formatStatus(contract.paymentStatus)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewContract(contract)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadContract(contract.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-green-50 text-green-700 hover:bg-green-100"
                            onClick={() => handleUpdateContractStatus(contract.id, ContractStatus.ACTIVE)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-red-50 text-red-700 hover:bg-red-100"
                            onClick={() => handleUpdateContractStatus(contract.id, ContractStatus.CANCELLED)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Hoardings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts
                    .filter(c => c.status === ContractStatus.COMPLETED)
                    .map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.id}</TableCell>
                      <TableCell>{contract.client}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">From</span>
                          <span>{contract.startDate}</span>
                          <span className="text-xs text-muted-foreground mt-1">To</span>
                          <span>{contract.endDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>{contract.value}</TableCell>
                      <TableCell>{contract.hoardingsCount}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          Completed
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(contract.paymentStatus)}`}>
                          {formatStatus(contract.paymentStatus)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewContract(contract)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadContract(contract.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cancelled" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Hoardings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts
                    .filter(c => c.status === ContractStatus.CANCELLED)
                    .map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.id}</TableCell>
                      <TableCell>{contract.client}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">From</span>
                          <span>{contract.startDate}</span>
                          <span className="text-xs text-muted-foreground mt-1">To</span>
                          <span>{contract.endDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>{contract.value}</TableCell>
                      <TableCell>{contract.hoardingsCount}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          Cancelled
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(contract.paymentStatus)}`}>
                          {formatStatus(contract.paymentStatus)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewContract(contract)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadContract(contract.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Contract</DialogTitle>
            <DialogDescription>
              Create a new contract for a client
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client">Select Client</Label>
              <Select value={formData.clientId} onValueChange={(value) => handleFormChange('clientId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <DatePicker 
                  date={formData.startDate}
                  setDate={(date) => handleFormChange('startDate', date)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <DatePicker 
                  date={formData.endDate}
                  setDate={(date) => handleFormChange('endDate', date)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hoardings">Select Hoardings</Label>
              <Select 
                value={formData.selectedHoardings.join(',')} 
                onValueChange={(value) => {
                  if (!value) {
                    handleFormChange('selectedHoardings', []);
                    return;
                  }
                  const values = value.split(',');
                  const nonEmptyValues = values.filter(v => v);
                  handleFormChange('selectedHoardings', nonEmptyValues);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hoardings" />
                </SelectTrigger>
                <SelectContent>
                  {availableHoardings.map(hoarding => (
                    <SelectItem key={hoarding.id} value={hoarding.id}>
                      {hoarding.name} - ₹{hoarding.dailyRate}/day
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground pt-1">
                {formData.selectedHoardings.length} hoardings selected
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Contract Value</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-semibold">₹{formData.contractValue || '0'}</p>
                <p className="text-xs text-muted-foreground">
                  {formData.selectedHoardings.length} hoardings for {
                    formData.startDate && formData.endDate ? 
                    Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 3600 * 24)) : 0
                  } days
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddContract}
              disabled={!formData.clientId || formData.selectedHoardings.length === 0}
            >
              Create Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Contract Details</DialogTitle>
            <DialogDescription>
              {selectedContract && `Contract ${selectedContract.id}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedContract && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{selectedContract.client}</h3>
                  <p className="text-sm text-muted-foreground">Contract ID: {selectedContract.id}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedContract.status)}`}>
                    {formatStatus(selectedContract.status)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(selectedContract.paymentStatus)}`}>
                    {formatStatus(selectedContract.paymentStatus)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{selectedContract.startDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">{selectedContract.endDate}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Contract Value</p>
                <p className="text-xl font-semibold">{selectedContract.value}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Hoardings Included</p>
                <div className="bg-muted p-3 rounded-md">
                  <p>{selectedContract.hoardingsCount} hoardings included in this contract</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => {
                      navigate('/hoardings', { state: { contractFilter: selectedContract.id } });
                    }}
                  >
                    View Hoardings
                  </Button>
                </div>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleDownloadContract(selectedContract.id)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                
                {selectedContract.status === ContractStatus.PENDING && (
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleUpdateContractStatus(selectedContract.id, ContractStatus.ACTIVE);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                )}
                
                {selectedContract.paymentStatus === PaymentStatus.PENDING && (
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      handleCreateInvoice(selectedContract.id);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contracts;
