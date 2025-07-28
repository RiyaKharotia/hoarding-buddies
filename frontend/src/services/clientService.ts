import api from "./api";
import { User, UserRole } from "@/contexts/AuthContext";

export interface Client extends User {
  status?: 'active' | 'inactive';
  contactPerson?: string;
  hoardingsCount?: number;
  contractsCount?: number;
  companyName?: string;
  website?: string;
  address?: string;
  uid?: any; // Add the uid property to support the nested structure from backend
}

interface ClientResponse {
  success: boolean;
  code: number;
  message: string;
  data: Client[] | { clients: Client[], pagination: any };
}

// Mock clients for fallback
const mockClients: Client[] = [
  {
    _id: "1",
    name: "Supernova Advertising",
    email: "robert@supernovaads.com",
    role: "client" as UserRole,
    avatar: "https://i.pravatar.cc/150?u=robert",
    phone: "+1 555-123-4567",
    location: "Bangalore",
    contactPerson: "Robert Smith",
    status: "active",
    hoardingsCount: 7,
    contractsCount: 4,
    companyName: "Supernova Advertising",
    website: "www.supernovaads.com",
    address: "123 Business Park, Bangalore"
  },
  {
    _id: "2",
    name: "Vision Media Group",
    email: "emily@visionmedia.com",
    role: "client" as UserRole,
    avatar: "https://i.pravatar.cc/150?u=emily",
    phone: "+1 555-987-6543",
    location: "Mumbai",
    contactPerson: "Emily Wong",
    status: "active",
    hoardingsCount: 12,
    contractsCount: 3,
    companyName: "Vision Media Group",
    website: "www.visionmedia.com",
    address: "456 Tech Park, Mumbai"
  },
  {
    _id: "3",
    name: "Fusion Brands",
    email: "michael@fusionbrands.com",
    role: "client" as UserRole,
    avatar: "https://i.pravatar.cc/150?u=michael",
    phone: "+1 555-456-7890",
    location: "Delhi",
    contactPerson: "Michael Johnson",
    status: "inactive",
    hoardingsCount: 0,
    contractsCount: 0,
    companyName: "Fusion Brands",
    website: "www.fusionbrands.com",
    address: "789 Business Hub, Delhi"
  },
  {
    _id: "4",
    name: "Spark Promotions",
    email: "anjali@sparkpromo.com",
    role: "client" as UserRole,
    avatar: "https://i.pravatar.cc/150?u=anjali",
    phone: "+1 555-789-0123",
    location: "Hyderabad",
    contactPerson: "Anjali Patel",
    status: "active",
    hoardingsCount: 5,
    contractsCount: 2,
    companyName: "Spark Promotions",
    website: "www.sparkpromo.com",
    address: "101 Promo Plaza, Hyderabad"
  },
  {
    _id: "5",
    name: "Client User",
    email: "client@demo.com",
    role: "client" as UserRole,
    avatar: "https://i.pravatar.cc/150?u=client",
    phone: "+91 76543 21098",
    location: "Bangalore",
    contactPerson: "Client User",
    status: "active",
    hoardingsCount: 2,
    contractsCount: 1,
    companyName: "Client Corp",
    website: "www.clientcorp.com",
    address: "456 Business Zone, Bangalore"
  }
];

export const clientService = {
  getAllClients: async (filters?: { search?: string, status?: string, page?: number, limit?: number }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await api.get<ClientResponse>(`/api/users/clients?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch clients, using mock data:", error);
      
      // Filter mock clients based on search and status
      let filteredClients = [...mockClients];
      
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filteredClients = filteredClients.filter(
          client => client.name.toLowerCase().includes(search) || 
                   client.email.toLowerCase().includes(search) ||
                   client.location?.toLowerCase().includes(search) ||
                   client.contactPerson?.toLowerCase().includes(search) ||
                   client.companyName?.toLowerCase().includes(search)
        );
      }
      
      if (filters?.status) {
        filteredClients = filteredClients.filter(
          client => client.status === filters.status
        );
      }
      
      // Calculate pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const total = filteredClients.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedClients = filteredClients.slice(startIndex, endIndex);
      
      return {
        success: true,
        code: 200,
        message: "Clients fetched successfully (mock)",
        data: {
          clients: paginatedClients,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      };
    }
  },
  
  getClientById: async (id: string) => {
    try {
      const response = await api.get<{ success: boolean, data: Client }>(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch client, using mock data:", error);
      
      // Find client in mock data
      const client = mockClients.find(c => c._id === id);
      
      if (!client) {
        throw new Error("Client not found");
      }
      
      return {
        success: true,
        code: 200,
        message: "Client fetched successfully (mock)",
        data: client
      };
    }
  },
  
  updateClient: async (id: string, data: Partial<Client>) => {
    try {
      const response = await api.put<{ success: boolean, data: Client }>(`/api/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Failed to update client:", error);
      throw error;
    }
  },
  
  getClientContracts: async (clientId: string) => {
    try {
      const response = await api.get(`/api/contracts`, {
        params: { clientId }
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch client contracts, using mock data:", error);
      
      // Mock contracts
      const mockContracts = [
        {
          _id: "c1",
          clientId,
          title: "MG Road Campaign",
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "active",
          value: 125000
        },
        {
          _id: "c2",
          clientId,
          title: "Airport Promotion",
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "active",
          value: 250000
        }
      ];
      
      return {
        success: true,
        code: 200,
        message: "Contracts fetched successfully (mock)",
        data: mockContracts
      };
    }
  }
};
