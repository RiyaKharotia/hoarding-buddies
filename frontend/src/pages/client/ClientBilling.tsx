
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, CreditCard, Download, FileText, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { billingService, Invoice } from "@/services/billingService";
import { format } from 'date-fns';
import { toast } from "sonner";

interface InvoiceItem {
  id: string;
  date: string;
  dueDate: string;
  amount: string;
  status: string;
  contractId: string;
  description: string;
}

const ClientBilling: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Calculate summary metrics
  const [totalPaid, setTotalPaid] = useState('₹0');
  const [pendingAmount, setPendingAmount] = useState('₹0');
  const [overdueAmount, setOverdueAmount] = useState('₹0');
  const [paidCount, setPaidCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    fetchInvoices();
  }, []);
  
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await billingService.getAllInvoices();
      
      if (response.success && response.data) {
        const invoiceData = Array.isArray(response.data) ? response.data : [response.data];
        
        // Transform API data to InvoiceItem format
        const transformedData: InvoiceItem[] = invoiceData.map((invoice: Invoice) => {
          let description = "Billboard Advertisement";
          
          // Get contract information if available
          if (invoice.contract && typeof invoice.contract === 'object') {
            const startDate = new Date(invoice.contract.startDate);
            const endDate = new Date(invoice.contract.endDate);
            const quarter = Math.floor((startDate.getMonth() / 3) + 1);
            description = `Premium Billboard Package - Q${quarter} Payment`;
          }
          
          return {
            id: invoice.invoiceNumber || invoice._id,
            date: format(new Date(invoice.createdAt), 'dd/MM/yyyy'),
            dueDate: format(new Date(invoice.dueDate), 'dd/MM/yyyy'),
            amount: `₹${invoice.amount.toLocaleString()}`,
            status: invoice.paymentStatus || 'pending',
            contractId: typeof invoice.contract === 'object' 
              ? invoice.contract._id 
              : (invoice.contract || 'Unknown'),
            description: description
          };
        });
        
        setInvoices(transformedData);
        
        // Calculate metrics
        calculateMetrics(transformedData);
      } else {
        console.info("No invoice data from API, using mock data");
        // Set mock data
        const mockInvoices = generateMockInvoices();
        setInvoices(mockInvoices);
        
        // Calculate metrics from mock data
        calculateMetrics(mockInvoices);
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      toast.error("Failed to load invoice data");
      
      // Fallback to mock data
      const mockInvoices = generateMockInvoices();
      setInvoices(mockInvoices);
      
      // Calculate metrics from mock data
      calculateMetrics(mockInvoices);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate mock data for fallback
  const generateMockInvoices = (): InvoiceItem[] => {
    return [
      {
        id: "INV-2023-001",
        date: "15/01/2023",
        dueDate: "14/02/2023",
        amount: "₹80,000",
        status: "paid",
        contractId: "CON-2023-001",
        description: "Premium Billboard Package - Q1 Payment"
      },
      {
        id: "INV-2023-002",
        date: "15/04/2023",
        dueDate: "14/05/2023",
        amount: "₹80,000",
        status: "paid",
        contractId: "CON-2023-001",
        description: "Premium Billboard Package - Q2 Payment"
      },
      {
        id: "INV-2023-003",
        date: "15/07/2023",
        dueDate: "14/08/2023",
        amount: "₹80,000",
        status: "pending",
        contractId: "CON-2023-001",
        description: "Premium Billboard Package - Q3 Payment"
      },
      {
        id: "INV-2023-004",
        date: "15/03/2023",
        dueDate: "14/04/2023",
        amount: "₹60,000",
        status: "paid",
        contractId: "CON-2023-002",
        description: "Koramangala Display Agreement - H1 Payment"
      },
      {
        id: "INV-2023-005",
        date: "15/06/2023",
        dueDate: "14/07/2023",
        amount: "₹45,000",
        status: "overdue",
        contractId: "CON-2023-003",
        description: "Electronic City Billboard - Initial Payment"
      }
    ];
  };
  
  // Calculate metrics for the billing summary
  const calculateMetrics = (invoiceData: InvoiceItem[]) => {
    let totalPaidAmount = 0;
    let totalPendingAmount = 0;
    let totalOverdueAmount = 0;
    let paidInvoices = 0;
    let pendingInvoices = 0;
    let overdueInvoices = 0;
    
    invoiceData.forEach(invoice => {
      const amount = parseInt(invoice.amount.replace(/[^\d]/g, ''));
      
      if (invoice.status === 'paid') {
        totalPaidAmount += amount;
        paidInvoices++;
      } else if (invoice.status === 'pending') {
        totalPendingAmount += amount;
        pendingInvoices++;
      } else if (invoice.status === 'overdue') {
        totalOverdueAmount += amount;
        overdueInvoices++;
      }
    });
    
    // Format currency values
    setTotalPaid(`₹${totalPaidAmount.toLocaleString()}`);
    setPendingAmount(`₹${totalPendingAmount.toLocaleString()}`);
    setOverdueAmount(`₹${totalOverdueAmount.toLocaleString()}`);
    
    // Set counts
    setPaidCount(paidInvoices);
    setPendingCount(pendingInvoices);
    setOverdueCount(overdueInvoices);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter invoices based on search query
  const filteredInvoices = invoices.filter(invoice => 
    invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.contractId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-6">My Billing</h1>
        <p className="text-muted-foreground">
          View and manage your invoice payments
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Paid</CardDescription>
            <CardTitle className="text-2xl text-green-600">{totalPaid}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">{paidCount} invoice{paidCount !== 1 ? 's' : ''}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl text-amber-600">{pendingAmount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">{pendingCount} invoice{pendingCount !== 1 ? 's' : ''}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overdue</CardDescription>
            <CardTitle className="text-2xl text-red-600">{overdueAmount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">{overdueCount} invoice{overdueCount !== 1 ? 's' : ''}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search invoices..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-pulse mb-4 h-6 w-24 bg-muted rounded mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Loading invoices...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Contract</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length > 0 ? filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.description}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>
                          <Button variant="link" className="p-0 h-auto" size="sm">
                            {invoice.contractId}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => toast.info(`Viewing invoice: ${invoice.id}`)}>
                              <FileText className="h-4 w-4" />
                            </Button>
                            {invoice.status === 'paid' ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => toast.success(`Downloading receipt for: ${invoice.id}`)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => toast.info(`Proceeding to payment for: ${invoice.id}`)}
                              >
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Search className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground font-medium">No invoices found</p>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery ? "Try a different search term" : "You don't have any invoices yet"}
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
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
                    <TableHead>Description</TableHead>
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
                    .filter(invoice => invoice.status === 'paid')
                    .map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.description}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>
                          <Button variant="link" className="p-0 h-auto" size="sm">
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
                            <Button size="sm" variant="outline" onClick={() => toast.info(`Viewing invoice: ${invoice.id}`)}>
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => toast.success(`Downloading receipt for: ${invoice.id}`)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredInvoices.filter(invoice => invoice.status === 'paid').length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <CheckCircle className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground font-medium">No paid invoices</p>
                          <p className="text-sm text-muted-foreground">
                            You don't have any paid invoices yet
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
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
                    <TableHead>Description</TableHead>
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
                    .filter(invoice => invoice.status === 'pending')
                    .map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.description}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>
                          <Button variant="link" className="p-0 h-auto" size="sm">
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
                            <Button size="sm" variant="outline" onClick={() => toast.info(`Viewing invoice: ${invoice.id}`)}>
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => toast.info(`Proceeding to payment for: ${invoice.id}`)}>
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredInvoices.filter(invoice => invoice.status === 'pending').length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Calendar className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground font-medium">No pending invoices</p>
                          <p className="text-sm text-muted-foreground">
                            You don't have any pending invoices at the moment
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
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
                    <TableHead>Description</TableHead>
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
                    .filter(invoice => invoice.status === 'overdue')
                    .map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.description}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>
                          <Button variant="link" className="p-0 h-auto" size="sm">
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
                            <Button size="sm" variant="outline" onClick={() => toast.info(`Viewing invoice: ${invoice.id}`)}>
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => toast.info(`Proceeding to payment for: ${invoice.id}`)}>
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredInvoices.filter(invoice => invoice.status === 'overdue').length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <CheckCircle className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground font-medium">No overdue invoices</p>
                          <p className="text-sm text-muted-foreground">
                            Great! You don't have any overdue invoices
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientBilling;
