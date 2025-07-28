
import api from "./api";

export interface SearchResults {
  hoardings?: any[];
  contracts?: any[];
  photos?: any[];
  users?: any[];
  assignments?: any[];
  billings?: any[];
}

interface SearchResponse {
  success: boolean;
  code: number;
  message: string;
  data: SearchResults;
}

// Mock data for fallbacks
const mockHoardings = [
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
  }
];

const mockContracts = [
  {
    _id: "mock-contract-1",
    hoarding: mockHoardings[0],
    client: { _id: "mock-client-1", name: "ABC Corp", email: "abc@example.com" },
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 450000,
    status: "active",
    terms: "Monthly payments, maintenance included"
  },
  {
    _id: "mock-contract-2",
    hoarding: mockHoardings[1],
    client: { _id: "mock-client-2", name: "XYZ Industries", email: "xyz@example.com" },
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 480000,
    status: "active",
    terms: "Upfront payment, client handles creative changes"
  }
];

const mockPhotos = [
  {
    _id: "mock-photo-1",
    hoarding: mockHoardings[0],
    url: "https://source.unsplash.com/random/800x600?billboard&sig=4",
    description: "Morning view of the MG Road billboard",
    takenBy: "Photographer Name",
    takenAt: new Date().toISOString(),
    status: "approved"
  },
  {
    _id: "mock-photo-2",
    hoarding: mockHoardings[1],
    url: "https://source.unsplash.com/random/800x600?billboard&sig=5",
    description: "Airport Road billboard with new creative",
    takenBy: "Photographer Name",
    takenAt: new Date().toISOString(),
    status: "approved"
  }
];

const mockUsers = [
  {
    _id: "mock-user-1",
    name: "John Admin",
    email: "admin@example.com",
    role: "owner",
    avatar: "https://i.pravatar.cc/150?u=1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "mock-user-2",
    name: "Sarah Photographer",
    email: "photo@example.com",
    role: "photographer",
    avatar: "https://i.pravatar.cc/150?u=2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "mock-user-3",
    name: "Mike Client",
    email: "client@example.com",
    role: "client",
    avatar: "https://i.pravatar.cc/150?u=3",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const searchService = {
  // Get mock data based on type
  getMockData: (type?: string): SearchResults => {
    const results: SearchResults = {};
    
    if (!type || type === 'hoardings') {
      results.hoardings = mockHoardings;
    }
    
    if (!type || type === 'contracts') {
      results.contracts = mockContracts;
    }
    
    if (!type || type === 'photos') {
      results.photos = mockPhotos;
    }
    
    if (!type || type === 'users') {
      results.users = mockUsers;
    }
    
    return results;
  },
  
  // Enhanced search function with fallback to mock data
  search: async (query: string, type?: string, filters?: Record<string, string>) => {
    try {
      const params = new URLSearchParams();
      params.append('query', query);
      
      if (type) {
        params.append('type', type);
      }
      
      // Add any additional filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(key, value);
        });
      }
      
      const response = await api.get<SearchResponse>(`/api/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Search error, falling back to mock data:", error);
      
      // Return mock data with proper response format
      return {
        success: true,
        code: 200,
        message: "Mock search results",
        data: searchService.getMockData(type)
      };
    }
  },
  
  // Public search that doesn't require authentication
  publicSearch: async (query: string, type?: string) => {
    try {
      const params = new URLSearchParams();
      params.append('query', query);
      
      if (type) {
        params.append('type', type);
      }
      
      const response = await api.get<SearchResponse>(`/api/public-search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Public search error, falling back to mock data:", error);
      
      // Return mock data with proper response format
      return {
        success: true,
        code: 200,
        message: "Mock public search results",
        data: { hoardings: mockHoardings.filter(h => h.status === 'active') }
      };
    }
  }
};
