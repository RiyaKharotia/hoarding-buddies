
import api from "./api";

export interface Contract {
  _id: string;
  contractNumber: string;
  hoarding: {
    _id: string;
    name: string;
    hoardingNumber: string;
    location: {
      address: string;
      city: string;
    };
    dailyRate: number;
  };
  client: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  clientId: string; // Added missing property
  owner: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: string;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContractResponse {
  success: boolean;
  code: number;
  message: string;
  data: Contract[] | Contract;
}

export const contractService = {
  getAllContracts: async (params?: { status?: string; clientId?: string }) => {
    const response = await api.get<ContractResponse>("/api/contracts", { params });
    return response.data;
  },
  
  getContractById: async (id: string) => {
    const response = await api.get<ContractResponse>(`/api/contracts/${id}`);
    return response.data;
  },
  
  createContract: async (data: {
    hoarding: string;
    client: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    termsAndConditions?: string;
  }) => {
    const response = await api.post<ContractResponse>("/api/contracts", data);
    return response.data;
  },
  
  updateContract: async (id: string, data: {
    status?: string;
    totalAmount?: number;
    startDate?: string;
    endDate?: string;
    termsAndConditions?: string;
  }) => {
    const response = await api.put<ContractResponse>(`/api/contracts/${id}`, data);
    return response.data;
  },
  
  deleteContract: async (id: string) => {
    const response = await api.delete<ContractResponse>(`/api/contracts/${id}`);
    return response.data;
  },
  
  downloadContract: async (id: string) => {
    const response = await api.get<ContractResponse>(`/api/contracts/${id}/download`);
    return response.data;
  }
};
