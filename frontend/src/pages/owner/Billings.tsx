import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, CreditCard, Download, FileText, BarChart3, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';
import { toast } from "sonner";
import api from "@/services/api";
import { useNavigate } from 'react-router-dom';
import { PaymentStatus } from "../../utils/constants";

interface Invoice {
  id: string;
  client: string;
  clientId: string;
  date: string;
  dueDate: string;
  amount: string;
  status: string;
  contractId: string;
}

interface Contract {
  id: string;
  client: string;
  clientId: string;
  totalAmount: number;
}

const Billings: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [availableContracts, setAvailableContracts] = useState<Contract[]>([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    contractId: '',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
    amount: '',
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/billings');
      
      if (response.data && response.data.data) {
        const transformedData = response.data.data.map((invoice: any) => ({
          id: invoice._id,
          client: invoice.client?.name || 'Unknown Client',
          clientId: invoice.client?._id,
          date: format(new Date(invoice.createdAt), 'dd/MM/yyyy'),
          dueDate: format(new Date(invoice.dueDate), 'dd/MM/yyyy'),
          amount: `₹${invoice.amount.toLocaleString()}`,
          status: invoice.paymentStatus || 'pending',
          contractId: typeof invoice.contract === 'object' ? invoice.contract._id : invoice.contract
        }));
        setInvoices(transformedData);
      } else {
        setInvoices(mockInvoices);
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      setInvoices(mockInvoices);
      toast.error("Failed to fetch invoices. Using mock data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableContracts = async () => {
    try {
      const response = await api.get('/api/contracts', {
        params: { status: 'active', paymentStatus: 'pending' }
      });
      
      if (response.data && response.data.data) {
        const contracts = response.data.data.map((contract: any) => ({
          id: contract._id,
          client: contract.client?.name || 'Unknown Client',
          clientId: contract.client?._id,
          totalAmount: contract.totalAmount
        }));
        setAvailableContracts(contracts);
      }
    } catch (error) {
      console.error("Failed to fetch contracts:", error);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'contractId') {
      const selectedContract = availableContracts.find(c => c.id === value);
      if (selectedContract) {
        setFormData(prev => ({ ...prev, amount: selectedContract.totalAmount.toString() }));
      }
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const payload = {
        contractId: formData.contractId,
        dueDate: format(new Date(formData.dueDate), 'yyyy-MM-dd'),
        amount: parseFloat(formData.amount)
      };

      toast.info("Creating invoice...");
      
      const response = await api.post('/api/billings/invoice', payload);
      
      if (response.data && response.data.data) {
        toast.success("Invoice created successfully");
        setIsCreateDialogOpen(false);
        resetForm();
        fetchInvoices();
      }
    } catch (error) {
      console.error("Failed to create invoice:", error);
      let errorMessage = "Failed to create invoice. Please try again.";
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        if (error.response.data && error.response.data.data) {
          errorMessage += `: ${error.response.data.data}`;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      contractId: '',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
      amount: '',
    });
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewDialogOpen(true);
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await api.get(`/api/billings/invoice/${invoiceId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Failed to download invoice:", error);
      toast.error("Failed to download invoice. Please try again.");
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      await api.put(`/api/billings/invoice/${invoiceId}`, {
        paymentStatus: PaymentStatus.PAID
      });
      
      toast.success("Invoice marked as paid");
      fetchInvoices();
    } catch (error) {
      console.error("Failed to update invoice:", error);
      toast.error("Failed to mark invoice as paid. Please try again.");
    }
  };

  const handleSendReminder = async (invoiceId: string) => {
    try {
      await api.post(`/api/billings/invoice/${invoiceId}/remind`);
      
      toast.success("Payment reminder sent successfully");
    } catch (error) {
      console.error("Failed to send reminder:", error);
      toast.error("Failed to send reminder. Please try again.");
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    return (
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.contractId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case PaymentStatus.PAID:
        return "bg-green-100 text-green-800";
      case PaymentStatus.PENDING:
        return "bg-amber-100 text-amber-800";
      case PaymentStatus.OVERDUE:
        return "bg-red-100 text-red-800";
      case PaymentStatus.CANCELLED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateMetrics = () => {
    let totalRevenue = 0;
    let pendingAmount = 0;
    let paidAmount = 0;
    let overdueAmount = 0;
    
    const pendingInvoices = invoices.filter(i => i.status === PaymentStatus.PENDING).length;
    const overdueInvoices = invoices.filter(i => i.status === PaymentStatus.OVERDUE).length;
    const paidInvoices = invoices.filter(i => i.status === PaymentStatus.PAID).length;
    
    invoices.forEach(invoice => {
      const amount = parseFloat(invoice.amount.replace(/[^\d.]/g, ''));
      totalRevenue += amount;
      
      if (invoice.status === PaymentStatus.PAID) {
        paidAmount += amount;
      } else if (invoice.status === PaymentStatus.PENDING) {
        pendingAmount += amount;
      } else if (invoice.status === PaymentStatus.OVERDUE) {
        overdueAmount += amount;
      }
    });
    
    return {
      totalRevenue: `₹${totalRevenue.toLocaleString()}`,
      pendingAmount: `₹${pendingAmount.toLocaleString()}`,
      paidAmount: `₹${paidAmount.toLocaleString()}`,
      overdueAmount: `₹${overdueAmount.toLocaleString()}`,
      pendingInvoices,
      overdueInvoices,
      paidInvoices
    };
  };

  const metrics = calculateMetrics();

  const mockInvoices: Invoice[] = [
    {
      id: "INV-2023-001",
      client: "Supernova Advertising",
      clientId: "1",
      date: "15/01/2023",
      dueDate: "14/02/2023",
      amount: "₹80,000",
      status: PaymentStatus.PAID,
      contractId: "CON-2023-001"
    },
    {
      id: "INV-2023-002",
      client: "Vision Media Group",
      clientId: "2",
      date: "01/03/2023",
      dueDate: "31/03/2023",
      amount: "₹140,000",
      status: PaymentStatus.PAID,
      contractId: "CON-2023-002"
    },
    {
      id: "INV-2023-003",
      client: "Spark Promotions",
      clientId: "3",
      date: "15/04/2023",
      dueDate: "15/05/2023",
      amount: "₹45,000",
      status: PaymentStatus.PAID,
      contractId: "CON-2023-003"
    },
    {
      id: "INV-2023-004",
      client: "Vision Media Group",
      clientId: "2",
      date: "01/06/2023",
      dueDate: "01/07/2023",
      amount: "₹140,000",
      status: PaymentStatus.PENDING,
      contractId: "CON-2023-002"
    },
    {
      id: "INV-2023-005",
      client: "Metro Displays",
      clientId: "4",
      date: "01/07/2023",
      dueDate: "31/07/2023",
      amount: "₹87,500",
      status: PaymentStatus.OVERDUE,
      contractId: "CON-2023-004"
    }
  ];

  const handleOpenCreateDialog = () => {
    fetchAvailableContracts();
    setIsCreateDialogOpen(true);
  };

  const formatStatus = (status: string | undefined) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">Billings Management</h1>
        <Button onClick={handleOpenCreateDialog}>
          <FileText className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl">{metrics.totalRevenue}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">All time</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Paid</CardDescription>
            <CardTitle className="text-2xl text-green-600">{metrics.paidAmount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">{metrics.paidInvoices} invoices</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl text-amber-600">{metrics.pendingAmount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">{metrics.pendingInvoices} invoices</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overdue</CardDescription>
            <CardTitle className="text-2xl text-red-600">{metrics.overdueAmount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">{metrics.overdueInvoices} invoice</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search invoices..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Invoices</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        Loading invoices...
                      </TableCell>
                    </TableRow>
                  ) : filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.client}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto" 
                            size="sm"
                            onClick={() => navigate(`/contracts`, { state: { contractId: invoice.contractId } })}
                          >
                            {invoice.contractId}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                            {formatStatus(invoice.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadInvoice(invoice.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {invoice.status === PaymentStatus.PENDING && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="bg-green-50 text-green-700 hover:bg-green-100"
                                onClick={() => handleMarkAsPaid(invoice.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {(invoice.status === PaymentStatus.PENDING || invoice.status === PaymentStatus.OVERDUE) && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                                onClick={() => handleSendReminder(invoice.id)}
                              >
                                <Calendar className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        No invoices found matching your search criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="paid" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices
                    .filter(invoice => invoice.status === PaymentStatus.PAID)
                    .map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.client}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto" 
                            size="sm"
                            onClick={() => navigate(`/contracts`, { state: { contractId: invoice.contractId } })}
                          >
                            {invoice.contractId}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Paid
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadInvoice(invoice.id)}
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
        
        <TabsContent value="pending" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices
                    .filter(invoice => invoice.status === PaymentStatus.PENDING)
                    .map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.client}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto" 
                            size="sm"
                            onClick={() => navigate(`/contracts`, { state: { contractId: invoice.contractId } })}
                          >
                            {invoice.contractId}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                            Pending
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadInvoice(invoice.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-green-50 text-green-700 hover:bg-green-100"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                              onClick={() => handleSendReminder(invoice.id)}
                            >
                              <Calendar className="h-4 w-4" />
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
        
        <TabsContent value="overdue" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices
                    .filter(invoice => invoice.status === PaymentStatus.OVERDUE)
                    .map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.client}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto" 
                            size="sm"
                            onClick={() => navigate(`/contracts`, { state: { contractId: invoice.contractId } })}
                          >
                            {invoice.contractId}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            Overdue
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadInvoice(invoice.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-green-50 text-green-700 hover:bg-green-100"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                              onClick={() => handleSendReminder(invoice.id)}
                            >
                              <Calendar className="h-4 w-4" />
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
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Create an invoice for an existing contract
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contract">Select Contract</Label>
              <Select value={formData.contractId} onValueChange={(value) => handleFormChange('contractId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a contract" />
                </SelectTrigger>
                <SelectContent>
                  {availableContracts.map(contract => (
                    <SelectItem key={contract.id} value={contract.id}>
                      {contract.client} - #{contract.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Payment Due Date</Label>
              <DatePicker 
                date={formData.dueDate}
                setDate={(date) => handleFormChange('dueDate', date)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Invoice Amount</Label>
              <div className="flex items-center space-x-2">
                <span>₹</span>
                <Input 
                  id="amount" 
                  value={formData.amount}
                  onChange={(e) => handleFormChange('amount', e.target.value)}
                  disabled={!!formData.contractId}
                  placeholder="Enter amount"
                />
              </div>
              {formData.contractId && (
                <p className="text-xs text-muted-foreground">
                  Amount is set automatically based on the selected contract
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateInvoice}
              disabled={!formData.contractId || !formData.amount}
            >
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              {selectedInvoice && `Invoice ${selectedInvoice.id}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{selectedInvoice.client}</h3>
                  <p className="text-sm text-muted-foreground">Invoice ID: {selectedInvoice.id}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedInvoice.status)}`}>
                  {formatStatus(selectedInvoice.status)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Invoice Date</p>
                  <p className="font-medium">{selectedInvoice.date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{selectedInvoice.dueDate}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-xl font-semibold">{selectedInvoice.amount}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Related Contract</p>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    navigate('/contracts', { state: { contractId: selectedInvoice.contractId } });
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {selectedInvoice.contractId}
                </Button>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleDownloadInvoice(selectedInvoice.id)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                
                {selectedInvoice.status === PaymentStatus.PENDING && (
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleMarkAsPaid(selectedInvoice.id);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </Button>
                )}
                
                {(selectedInvoice.status === PaymentStatus.PENDING || selectedInvoice.status === PaymentStatus.OVERDUE) && (
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      handleSendReminder(selectedInvoice.id);
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Send Reminder
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

export default Billings;
