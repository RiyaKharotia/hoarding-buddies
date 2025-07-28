
import api from "./api";

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  contract: {
    _id: string;
    contractNumber: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
  };
  client: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  owner: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  amount: number;
  paymentStatus: string;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface BillingResponse {
  success: boolean;
  code: number;
  message: string;
  data: Invoice[] | Invoice | BillingAnalytics;
}

export interface BillingAnalytics {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  invoicesByStatus: {
    [key: string]: number;
  };
  recentInvoices: Invoice[];
  upcomingInvoices: Invoice[];
}

export const billingService = {
  getAllInvoices: async (params?: { status?: string; contractId?: string; clientId?: string }) => {
    const response = await api.get<BillingResponse>("/api/billings", { params });
    return response.data;
  },
  
  getInvoiceById: async (id: string) => {
    const response = await api.get<BillingResponse>(`/api/billings/invoice/${id}`);
    return response.data;
  },
  
  createInvoice: async (data: {
    contractId: string;
    amount: number;
    dueDate: string;
    notes?: string;
  }) => {
    const response = await api.post<BillingResponse>("/api/billings/invoice", data);
    return response.data;
  },
  
  updateInvoice: async (id: string, data: {
    paymentStatus?: string;
    paymentDate?: string;
    paymentMethod?: string;
    transactionId?: string;
    notes?: string;
  }) => {
    const response = await api.put<BillingResponse>(`/api/billings/invoice/${id}`, data);
    return response.data;
  },
  
  deleteInvoice: async (id: string) => {
    const response = await api.delete<BillingResponse>(`/api/billings/invoice/${id}`);
    return response.data;
  },
  
  downloadInvoice: async (id: string) => {
    const response = await api.get<BillingResponse>(`/api/billings/invoice/${id}/download`);
    return response.data;
  },
  
  sendPaymentReminder: async (id: string) => {
    const response = await api.post<BillingResponse>(`/api/billings/invoice/${id}/remind`);
    return response.data;
  },
  
  getBillingAnalytics: async () => {
    const response = await api.get<BillingResponse>("/api/billings/analytics");
    return response.data;
  }
};
