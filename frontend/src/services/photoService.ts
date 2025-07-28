
import api from "./api";

export interface PhotoResponse {
  success: boolean;
  code: number;
  message: string;
  data: Photo[] | Photo;
}

export interface Photo {
  _id: string;
  fileName: string;
  filePath: string;
  imageUrl?: string;
  hoarding: {
    _id: string;
    name: string;
    location: {
      address: string;
      city: string;
    }
  };
  uploadedBy: {
    _id: string;
    name: string;
  };
  assignment?: {
    _id: string;
    dueDate: string;
  };
  takenAt: string;
  metadata: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
  caption?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const photoService = {
  getAllPhotos: async (filters?: Record<string, any>) => {
    // Convert filters to query parameters
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/api/photos?${queryString}` : "/api/photos";
    
    const response = await api.get<PhotoResponse>(url);
    return response.data;
  },
  
  getPhotoById: async (id: string) => {
    const response = await api.get<PhotoResponse>(`/api/photos/${id}`);
    return response.data;
  },
  
  uploadPhoto: async (formData: FormData) => {
    const response = await api.post<PhotoResponse>("/api/photos", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  
  updatePhoto: async (id: string, data: { caption?: string, status?: string }) => {
    const response = await api.put<PhotoResponse>(`/api/photos/${id}`, data);
    return response.data;
  },
  
  deletePhoto: async (id: string) => {
    const response = await api.delete<PhotoResponse>(`/api/photos/${id}`);
    return response.data;
  },
  
  getPhotosByHoarding: async (hoardingId: string) => {
    const response = await api.get<PhotoResponse>(`/api/photos/hoarding/${hoardingId}`);
    return response.data;
  },
  
  getPhotosByAssignment: async (assignmentId: string) => {
    const response = await api.get<PhotoResponse>(`/api/photos/assignment/${assignmentId}`);
    return response.data;
  }
};
