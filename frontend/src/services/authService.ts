
import api from "./api";
import { User, RegisterData } from "@/contexts/AuthContext";

interface LoginResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

interface RegisterResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post<LoginResponse>("/api/users/login", {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  
  register: async (userData: RegisterData) => {
    try {
      // Use FormData to handle file upload
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("email", userData.email);
      formData.append("password", userData.password);
      formData.append("role", userData.role);
      
      if (userData.avatar) {
        formData.append("avatar", userData.avatar);
      }
      
      if (userData.phone) {
        formData.append("phone", userData.phone.toString());
      }
      
      if (userData.location) {
        formData.append("location", userData.location);
      }
      
      const response = await api.post<RegisterResponse>("/api/users/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
  },

  getProfile: async () => {
    try {
      const response = await api.get('/api/users/profile');
      return response.data;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  }
};
