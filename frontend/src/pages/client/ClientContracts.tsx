import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, Download, FileText, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from '@tanstack/react-query';
import { contractService, Contract } from '@/services/contractService';
import { format } from 'date-fns';

// Define a type for our local contract data structure
interface LocalContract {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  value: string;
  hoardingsCount: number;
  status: string;
  paymentStatus: string;
}

// Mock data for contracts
const mockContracts: LocalContract[] = [
  {
    id: "CON-2023-001",
    title: "Premium Billboard Package",
    startDate: "01/01/2023",
    endDate: "31/12/2023",
    value: "₹240,000",
    hoardingsCount: 2,
    status: "active",
    paymentStatus: "paid"
  },
  {
    id: "CON-2023-002",
    title: "Koramangala Display Agreement",
    startDate: "15/03/2023",
    endDate: "14/03/2024",
    value: "₹120,000",
    hoardingsCount: 1,
    status: "active",
    paymentStatus: "partial"
  },
  {
    id: "CON-2023-003",
    title: "Electronic City Billboard",
    startDate: "01/06/2023",
    endDate: "31/05/2024",
    value: "₹180,000",
    hoardingsCount: 1,
    status: "pending",
    paymentStatus: "pending"
  },
  {
    id: "CON-2022-004",
    title: "HSR Layout Unipole",
    startDate: "01/08/2022",
    endDate: "31/07/2023",
    value: "₹90,000",
    hoardingsCount: 1,
    status: "expired",
    paymentStatus: "paid"
  },
];

// Helper function to transform API contract to our local contract format
const transformApiContract = (contract: Contract): LocalContract => {
  return {
    id: contract._id || "",
    title: contract.hoarding?.name || "Untitled Contract",
    startDate: format(new Date(contract.startDate), 'dd/MM/yyyy'),
    endDate: format(new Date(contract.endDate), 'dd/MM/yyyy'),
    value: `₹${contract.totalAmount?.toLocaleString() || "0"}`,
    hoardingsCount: 1, // Always 1 as per API structure
    status: contract.status || "unknown",
    paymentStatus: "pending" // Default since API doesn't have this field
  };
};

const ClientContracts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch contracts using React Query
  const { data, isLoading } = useQuery({
    queryKey: ['clientContracts'],
    queryFn: async () => {
      try {
        const response = await contractService.getAllContracts();
        return response.data;
      } catch (error) {
        console.error("Error fetching contracts:", error);
        // Return mock data as fallback
        return mockContracts;
      }
    }
  });

  // Transform API data or use mock data
  const contractsArray: LocalContract[] = React.useMemo(() => {
    if (!data) return mockContracts;
    
    if (Array.isArray(data)) {
      // If it's API data in Contract format, transform it
      if (data.length > 0 && '_id' in data[0]) {
        // Type assertion to ensure TypeScript knows this is a Contract array
        return (data as Contract[]).map(transformApiContract);
      }
      // If it's already in our local format (like mock data)
      return data as LocalContract[];
    }
    
    // Single contract case
    if (data && typeof data === 'object' && '_id' in data) {
      // Type assertion to ensure TypeScript knows this is a Contract
      return [transformApiContract(data as Contract)];
    }
    
    return mockContracts;
  }, [data]);
  
  // Filter contracts based on search term
  const filteredContracts = contractsArray.filter((contract) => 
    contract.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Safely get status color with null checks
  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Safely get payment status color with null checks
  const getPaymentStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-800";
      case "partial":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Safely format status for display
  const formatStatus = (status: string | undefined) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-6">My Contracts</h1>
        <p className="text-muted-foreground">
          View and manage your advertising contracts
        </p>
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
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Hoardings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        Loading contracts...
                      </TableCell>
                    </TableRow>
                  ) : filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.id}</TableCell>
                      <TableCell>{contract.title}</TableCell>
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
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
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
        
        {/* Filter tabs for different contract statuses */}
        {["active", "pending", "expired"].map((statusFilter) => (
          <TabsContent key={statusFilter} value={statusFilter} className="space-y-4 mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract ID</TableHead>
                      <TableHead>Title</TableHead>
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
                      .filter(c => c.status === statusFilter)
                      .map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">{contract.id}</TableCell>
                          <TableCell>{contract.title}</TableCell>
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
                              <Button size="sm" variant="outline">
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
                              </Button>
                              {contract.status === "pending" && (
                                <Button size="sm" variant="outline">
                                  <CheckCircle className="h-4 w-4" />
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
        ))}
      </Tabs>
    </div>
  );
};

export default ClientContracts;
