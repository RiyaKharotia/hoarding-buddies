import api from "./api";

export interface Hoarding {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    }
  };
  size: {
    width: number;
    height: number;
    unit: string;
  };
  dailyRate: number;
  status: string;
  images: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedHoardings {
  hoardings: Hoarding[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export type HoardingResponseData = Hoarding[] | Hoarding | PaginatedHoardings;

interface HoardingResponse {
  success: boolean;
  code: number;
  message: string;
  data: HoardingResponseData;
}

// Mock hoardings for fallback
const mockHoardings: Hoarding[] = [
  {
    _id: "mock-hoarding-1",
    name: "MG Road Billboard",
    location: {
      address: "MG Road, Near Metro Station",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      zipCode: "560001",
      coordinates: { latitude: 12.9716, longitude: 77.5946 }
    },
    size: { width: 40, height: 20, unit: "feet" },
    dailyRate: 5000,
    status: "active",
    images: ["https://source.unsplash.com/random/800x600?billboard&sig=1"],
    owner: "mock-owner-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "mock-hoarding-2",
    name: "Airport Road Display",
    location: {
      address: "Airport Road, Terminal 1",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      zipCode: "400099",
      coordinates: { latitude: 19.0896, longitude: 72.8656 }
    },
    size: { width: 60, height: 30, unit: "feet" },
    dailyRate: 8000,
    status: "active",
    images: ["https://source.unsplash.com/random/800x600?billboard&sig=2"],
    owner: "mock-owner-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "mock-hoarding-3",
    name: "Highway Digital Board",
    location: {
      address: "NH-44, Outer Ring Road",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      zipCode: "110001",
      coordinates: { latitude: 28.7041, longitude: 77.1025 }
    },
    size: { width: 50, height: 25, unit: "feet" },
    dailyRate: 6500,
    status: "maintenance",
    images: ["https://source.unsplash.com/random/800x600?billboard&sig=3"],
    owner: "mock-owner-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "mock-hoarding-4",
    name: "Mall Entrance Billboard",
    location: {
      address: "Phoenix MarketCity, Whitefield",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      zipCode: "560066",
      coordinates: { latitude: 12.9971, longitude: 77.6968 }
    },
    size: { width: 30, height: 15, unit: "feet" },
    dailyRate: 4500,
    status: "active",
    images: ["https://source.unsplash.com/random/800x600?billboard&sig=4"],
    owner: "mock-owner-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "mock-hoarding-5",
    name: "Railway Station Display",
    location: {
      address: "Central Railway Station, Platform 1",
      city: "Chennai",
      state: "Tamil Nadu",
      country: "India",
      zipCode: "600003",
      coordinates: { latitude: 13.0827, longitude: 80.2707 }
    },
    size: { width: 20, height: 10, unit: "feet" },
    dailyRate: 3000,
    status: "inactive",
    images: ["https://source.unsplash.com/random/800x600?billboard&sig=5"],
    owner: "mock-owner-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const hoardingService = {
  getAllHoardings: async (params?: { status?: string, city?: string, page?: number, limit?: number }) => {
    try {
      const urlParams = new URLSearchParams();
      if (params?.status) urlParams.append('status', params.status);
      if (params?.city) urlParams.append('city', params.city);
      if (params?.page) urlParams.append('page', params.page.toString());
      if (params?.limit) urlParams.append('limit', params.limit.toString());
      
      const queryString = urlParams.toString() ? `?${urlParams.toString()}` : '';
      const response = await api.get<HoardingResponse>(`/api/hoardings${queryString}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch hoardings, using mock data:", error);
      
      // Filter mock hoardings based on params
      let filteredHoardings = [...mockHoardings];
      
      if (params?.status) {
        filteredHoardings = filteredHoardings.filter(h => h.status === params.status);
      }
      
      if (params?.city) {
        const cityLower = params.city.toLowerCase();
        filteredHoardings = filteredHoardings.filter(
          h => h.location.city.toLowerCase().includes(cityLower)
        );
      }
      
      // Apply pagination
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const total = filteredHoardings.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedHoardings = filteredHoardings.slice(startIndex, endIndex);
      
      return {
        success: true,
        code: 200,
        message: "Hoardings fetched successfully (mock)",
        data: {
          hoardings: paginatedHoardings,
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
  
  getHoardingById: async (id: string) => {
    try {
      const response = await api.get<HoardingResponse>(`/api/hoardings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch hoarding with ID ${id}, using mock data:`, error);
      
      // Find hoarding in mock data
      const hoarding = mockHoardings.find(h => h._id === id);
      
      if (!hoarding) {
        throw new Error("Hoarding not found");
      }
      
      return {
        success: true,
        code: 200,
        message: "Hoarding fetched successfully (mock)",
        data: hoarding
      };
    }
  },
  
  createHoarding: async (formData: FormData) => {
    try {
      const response = await api.post<HoardingResponse>("/api/hoardings", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create hoarding:", error);
      throw error;
    }
  },
  
  updateHoarding: async (id: string, formData: FormData) => {
    try {
      const response = await api.put<HoardingResponse>(`/api/hoardings/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to update hoarding with ID ${id}:`, error);
      throw error;
    }
  },
  
  deleteHoarding: async (id: string) => {
    try {
      const response = await api.delete<HoardingResponse>(`/api/hoardings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete hoarding with ID ${id}:`, error);
      throw error;
    }
  },
  
  removeHoardingImage: async (id: string, imageUrl: string) => {
    try {
      const response = await api.delete<HoardingResponse>(`/api/hoardings/${id}/images`, {
        data: { imageUrl }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to remove image from hoarding with ID ${id}:`, error);
      throw error;
    }
  },
  
  getHoardingsByStatus: async (status: string) => {
    try {
      const response = await api.get<HoardingResponse>(`/api/hoardings/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch hoardings with status ${status}, using mock data:`, error);
      
      // Filter hoardings by status
      const filteredHoardings = mockHoardings.filter(h => h.status === status);
      
      return {
        success: true,
        code: 200,
        message: `Hoardings with status ${status} fetched successfully (mock)`,
        data: filteredHoardings
      };
    }
  },
  
  getHoardingsByLocation: async (city: string) => {
    try {
      const response = await api.get<HoardingResponse>(`/api/hoardings/location/${city}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch hoardings in ${city}, using mock data:`, error);
      
      // Filter hoardings by city
      const cityLower = city.toLowerCase();
      const filteredHoardings = mockHoardings.filter(h => 
        h.location.city.toLowerCase().includes(cityLower)
      );
      
      return {
        success: true,
        code: 200,
        message: `Hoardings in ${city} fetched successfully (mock)`,
        data: filteredHoardings
      };
    }
  },
  
  searchHoardings: async (query: string) => {
    try {
      const params = new URLSearchParams({ query });
      const response = await api.get<HoardingResponse>(`/api/search?${params.toString()}&type=hoardings`);
      return response.data;
    } catch (error) {
      console.error(`Failed to search hoardings with query ${query}, using mock data:`, error);
      
      // Search hoardings by name, address, or city
      const queryLower = query.toLowerCase();
      const filteredHoardings = mockHoardings.filter(h => 
        h.name.toLowerCase().includes(queryLower) ||
        h.location.address.toLowerCase().includes(queryLower) ||
        h.location.city.toLowerCase().includes(queryLower)
      );
      
      return {
        success: true,
        code: 200,
        message: "Hoarding search results (mock)",
        data: { hoardings: filteredHoardings }
      };
    }
  }
};
