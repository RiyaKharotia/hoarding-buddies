
// User roles
export const UserRole = {
  OWNER: 'owner',
  PHOTOGRAPHER: 'photographer',
  CLIENT: 'client'
};

// Hoarding status
export const HoardingStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance'
};

// Contract status
export const ContractStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Payment status
export const PaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

// Assignment status
export const AssignmentStatus = {
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Photo status
export const PhotoStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// API URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://melodic-billboard-portal.onrender.com";
