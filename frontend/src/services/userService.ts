
import api from "./api";
import { User, UserRole } from "@/contexts/AuthContext";

interface UserResponse {
  success: boolean;
  code: number;
  message: string;
  data: User | User[] | { users: User[], pagination: any };
}

// Mock users for fallback
const mockUsers = [
  {
    _id: "1",
    name: "Admin User",
    email: "admin@showit.max",
    role: "owner" as UserRole,
    avatar: "https://i.pravatar.cc/150?u=admin",
    phone: "+91 98765 43210",
    location: "Mumbai",
    companyName: "ShowIt Media",
    website: "www.showit.media",
    address: "123 Business Park, Mumbai"
  },
  {
    _id: "2",
    name: "Photographer User",
    email: "photo@showit.max",
    role: "photographer" as UserRole,
    avatar: "https://i.pravatar.cc/150?u=photographer",
    phone: "+91 87654 32109",
    location: "Delhi"
  },
  {
    _id: "3",
    name: "Client User",
    email: "client@showit.max",
    role: "client" as UserRole,
    avatar: "https://i.pravatar.cc/150?u=client",
    phone: "+91 76543 21098",
    location: "Bangalore",
    companyName: "Client Corp",
    website: "www.clientcorp.com",
    address: "456 Business Zone, Bangalore"
  },
  {
    _id: "4",
    name: "John Smith",
    email: "john@showit.max",
    role: "photographer" as UserRole,
    avatar: "https://i.pravatar.cc/150?u=john",
    phone: "+91 67890 12345",
    location: "Chennai"
  },
  {
    _id: "5",
    name: "Sarah Johnson",
    email: "sarah@showit.max",
    role: "client" as UserRole,
    avatar: "https://i.pravatar.cc/150?u=sarah",
    phone: "+91 56789 01234",
    location: "Hyderabad",
    companyName: "Johnson Media",
    website: "www.johnsonmedia.com",
    address: "789 Tech Park, Hyderabad"
  }
];

// Additional mock photographers
const mockPhotographers = [
  ...mockUsers.filter(user => user.role === "photographer"),
  {
    _id: "6",
    name: "Michael Brown",
    email: "michael@showit.max",
    role: "photographer" as UserRole,
    avatar: "https://i.pravatar.cc/150?u=michael",
    phone: "+91 45678 90123",
    location: "Pune"
  },
  {
    _id: "7",
    name: "Emily Davis",
    email: "emily@showit.max",
    role: "photographer" as UserRole,
    avatar: "https://i.pravatar.cc/150?u=emily",
    phone: "+91 34567 89012",
    location: "Kolkata"
  }
];

// Additional mock clients
const mockClients = [
  ...mockUsers.filter(user => user.role === "client"),
  {
    _id: "8",
    name: "David Wilson",
    email: "david@showit.max",
    role: "client" as UserRole,
    avatar: "https://i.pravatar.cc/150?u=david",
    phone: "+91 23456 78901",
    location: "Ahmedabad",
    companyName: "Wilson Enterprises",
    website: "www.wilsonent.com",
    address: "101 Business Hub, Ahmedabad"
  },
  {
    _id: "9",
    name: "Jennifer Lee",
    email: "jennifer@showit.max",
    role: "client" as UserRole,
    avatar: "https://i.pravatar.cc/150?u=jennifer",
    phone: "+91 12345 67890",
    location: "Jaipur",
    companyName: "Lee & Associates",
    website: "www.leeassociates.com",
    address: "202 Commercial Center, Jaipur"
  }
];

export const userService = {
  getAllUsers: async (filters?: { role?: string, search?: string, page?: number, limit?: number }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await api.get<UserResponse>(`/api/user?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch users, using mock data:", error);
      
      // Filter mock users based on role
      let filteredUsers = [...mockUsers];
      if (filters?.role === 'photographer') {
        filteredUsers = mockPhotographers;
      } else if (filters?.role === 'client') {
        filteredUsers = mockClients;
      }
      
      // Apply search filter if provided
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(
          user => user.name.toLowerCase().includes(search) || 
                 user.email.toLowerCase().includes(search)
        );
      }
      
      // Calculate pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const total = filteredUsers.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
      return {
        success: true,
        code: 200,
        message: "Users fetched successfully (mock)",
        data: {
          users: paginatedUsers,
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
  
  getUserById: async (id: string) => {
    try {
      const response = await api.get<UserResponse>(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user, using mock data:", error);
      
      // Find user in mock data
      const user = mockUsers.find(u => u._id === id);
      
      if (!user) {
        throw new Error("User not found");
      }
      
      return {
        success: true,
        code: 200,
        message: "User fetched successfully (mock)",
        data: user
      };
    }
  },
  
  getPhotographers: async (search?: string) => {
    try {
      const params = new URLSearchParams();
      params.append('role', 'photographer');
      if (search) params.append('search', search);
      
      const response = await api.get<UserResponse>(`/api/user?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch photographers, using mock data:", error);
      
      // Filter photographers based on search
      let filteredPhotographers = [...mockPhotographers];
      if (search) {
        const searchLower = search.toLowerCase();
        filteredPhotographers = filteredPhotographers.filter(
          p => p.name.toLowerCase().includes(searchLower) || 
               p.email.toLowerCase().includes(searchLower)
        );
      }
      
      return {
        success: true,
        code: 200,
        message: "Photographers fetched successfully (mock)",
        data: {
          users: filteredPhotographers,
          pagination: {
            total: filteredPhotographers.length,
            page: 1,
            limit: 20,
            pages: 1
          }
        }
      };
    }
  },
  
  getClients: async (search?: string) => {
    try {
      const params = new URLSearchParams();
      params.append('role', 'client');
      if (search) params.append('search', search);
      
      const response = await api.get<UserResponse>(`/api/user?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch clients, using mock data:", error);
      
      // Filter clients based on search
      let filteredClients = [...mockClients];
      if (search) {
        const searchLower = search.toLowerCase();
        filteredClients = filteredClients.filter(
          c => c.name.toLowerCase().includes(searchLower) || 
               c.email.toLowerCase().includes(searchLower)
        );
      }
      
      return {
        success: true,
        code: 200,
        message: "Clients fetched successfully (mock)",
        data: {
          users: filteredClients,
          pagination: {
            total: filteredClients.length,
            page: 1,
            limit: 20,
            pages: 1
          }
        }
      };
    }
  },
  
  updateUser: async (id: string, userData: Partial<User>) => {
    try {
      const response = await api.put<UserResponse>(`/api/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  },
  
  deleteUser: async (id: string) => {
    try {
      const response = await api.delete(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw error;
    }
  },
  
  // User profile methods
  getUserProfile: async () => {
    try {
      const response = await api.get<UserResponse>('/api/users/profile');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user profile, using mock data:", error);
      
      // Return first mock user based on role
      const mockUser = mockUsers[0]; // Default to admin
      
      return {
        success: true,
        code: 200,
        message: "User profile fetched successfully (mock)",
        data: mockUser
      };
    }
  },
  
  updateUserProfile: async (userData: FormData) => {
    try {
      const response = await api.put<UserResponse>('/api/users/profile', userData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw error;
    }
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.put('/api/users/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error("Failed to change password:", error);
      throw error;
    }
  }
};
