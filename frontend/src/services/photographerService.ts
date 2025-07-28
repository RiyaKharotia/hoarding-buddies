
import api from "./api";
import { API_BASE_URL } from "@/utils/constants";

export interface Photo {
  _id: string;
  filePath: string;
  assignment: string;
  photographer: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  hoarding?: {
    _id: string;
    name: string;
    location: {
      address: string;
      city: string;
    };
    images?: string[];
  };
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    format?: string;
  };
}

export interface Photographer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string;
  role?: string;
  status: 'active' | 'inactive';
  assignedHoardings?: number;
  photosUploaded?: number;
  bio?: string;
  uid?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    avatar?: string;
    role?: string;
  };
}

export interface Assignment {
  _id: string;
  hoarding: {
    _id: string;
    name: string;
    location: {
      address: string;
      city: string;
    };
    images?: string[];
  };
  photographer: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  assignedBy: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  dueDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
}

export interface DashboardStats {
  assignedHoardings: number;
  locations: number;
  photosUploaded: number;
  thisMonth: number;
  pendingUploads: number;
  dueSoon: number;
  imageQualityScore: number;
  lastFiftyUploads: number;
}

export const photographerService = {
  getAssignments: async (assignmentId?: string, status?: string): Promise<ApiResponse<Assignment[]>> => {
    try {
      const params = new URLSearchParams();
      if (status) {
        params.append('status', status);
      }
      if (assignmentId) {
        params.append('id', assignmentId);
      }

      const response = await api.get<any>(`/api/assignments?${params.toString()}`);
      
      if (response.data.success) {
        return {
          success: true,
          code: response.data.code || 200,
          message: response.data.message || "Assignments fetched successfully",
          data: response.data.data || []
        };
      }
      
      throw new Error(response.data.message || "Failed to fetch assignments");
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
      return {
        success: false,
        code: 500,
        message: "Failed to fetch assignments",
      };
    }
  },
  
  updateAssignmentStatus: async (assignmentId: string, status: string): Promise<ApiResponse<Assignment>> => {
    try {
      const response = await api.put<any>(`/api/assignments/${assignmentId}/status`, { status });
      
      if (response.data.success) {
        return {
          success: true,
          code: response.data.code || 200,
          message: response.data.message || "Assignment status updated successfully",
          data: response.data.data
        };
      }
      
      throw new Error(response.data.message || "Failed to update assignment status");
    } catch (error) {
      console.error("Failed to update assignment status:", error);
      return {
        success: false,
        code: 500,
        message: "Failed to update assignment status",
      };
    }
  },
  
  getPhotosByAssignment: async (assignmentId: string): Promise<ApiResponse<Photo[]>> => {
    try {
      const response = await api.get<any>(`/api/photos?assignment=${assignmentId}`);
      
      if (response.data.success) {
        return {
          success: true,
          code: response.data.code || 200,
          message: response.data.message || "Photos fetched successfully",
          data: response.data.data || []
        };
      }
      
      throw new Error(response.data.message || "Failed to fetch photos");
    } catch (error) {
      console.error("Failed to fetch photos:", error);
      return {
        success: false,
        code: 500,
        message: "Failed to fetch photos",
      };
    }
  },

  getPhotos: async (filters?: { status?: string }): Promise<ApiResponse<Photo[]>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) {
        params.append('status', filters.status);
      }
      
      const response = await api.get<any>(`/api/photos?${params.toString()}`);
      
      if (response.data.success) {
        return {
          success: true,
          code: response.data.code || 200,
          message: response.data.message || "Photos fetched successfully",
          data: response.data.data || []
        };
      }
      
      throw new Error(response.data.message || "Failed to fetch photos");
    } catch (error) {
      console.error("Failed to fetch photos:", error);
      return {
        success: false,
        code: 500,
        message: "Failed to fetch photos",
      };
    }
  },

  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      const response = await api.get<any>('/api/photographers/stats');
      
      if (response.data.success) {
        return {
          success: true,
          code: response.data.code || 200,
          message: response.data.message || "Dashboard stats fetched successfully",
          data: response.data.data
        };
      }
      
      throw new Error(response.data.message || "Failed to fetch dashboard stats");
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      return {
        success: false,
        code: 500,
        message: "Failed to fetch dashboard stats",
      };
    }
  },

  getAllPhotographers: async (filters?: { status?: string, search?: string }): Promise<ApiResponse<Photographer[]>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) {
        params.append('status', filters.status);
      }
      
      if (filters?.search) {
        params.append('search', filters.search);
      }
      
      const response = await api.get<any>(`/api/users/photographers?${params.toString()}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          code: response.data.code || 200,
          message: response.data.message || "Photographers fetched successfully",
          data: response.data.data?.photographers || []
        };
      }
      
      throw new Error("Invalid response format");
    } catch (error) {
      console.error("Failed to fetch photographers:", error);
      return {
        success: false,
        code: 500,
        message: "Failed to fetch photographers",
      };
    }
  },

  assignHoarding: async (photographerId: string, hoardingId: string, dueDate: string, notes?: string): Promise<ApiResponse<Assignment>> => {
    try {
      const response = await api.post<any>('/api/assignments', {
        hoardingId,
        photographerId,
        dueDate,
        notes
      });
      
      if (response.data.success) {
        return {
          success: true,
          code: response.data.code || 201,
          message: response.data.message || "Hoarding assigned successfully",
          data: response.data.data
        };
      }
      
      throw new Error(response.data.message || "Failed to assign hoarding");
    } catch (error) {
      console.error("Failed to assign hoarding:", error);
      return {
        success: false,
        code: 500,
        message: "Failed to assign hoarding",
      };
    }
  }
};
