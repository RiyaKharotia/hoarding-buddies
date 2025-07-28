
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Public pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import Search from "./pages/Search";
import Index from "./pages/Index";

// Layout component
import AppLayout from "./components/layout/AppLayout";

// Owner pages
import Dashboard from "./pages/owner/Dashboard";
import Hoardings from "./pages/owner/Hoardings";
import Photographers from "./pages/owner/Photographers";
import Clients from "./pages/owner/Clients";
import Contracts from "./pages/owner/Contracts";
import Billings from "./pages/owner/Billings";
import Photos from "./pages/owner/Photos";
import Analytics from "./pages/owner/Analytics";
import Settings from "./pages/owner/Settings";

// Photographer pages
import PhotographerDashboard from "./pages/photographer/PhotographerDashboard";
import PhotoUpload from "./pages/photographer/PhotoUpload";
import PhotographerAssignments from "./pages/photographer/PhotographerAssignments";
import AssignmentDetails from "./pages/photographer/AssignmentDetails";
import PhotoHistory from "./pages/photographer/PhotoHistory";
import PhotographerSettings from "./pages/photographer/PhotographerSettings";

// Client pages
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientHoardings from "./pages/client/ClientHoardings";
import ClientPhotos from "./pages/client/ClientPhotos";
import ClientContracts from "./pages/client/ClientContracts";
import ClientBilling from "./pages/client/ClientBilling";
import ClientSettings from "./pages/client/ClientSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Search page - accessible to all authenticated users */}
            <Route path="/search" element={<AppLayout />}>
              <Route index element={<Search />} />
            </Route>

            {/* Owner routes */}
            <Route path="/dashboard" element={<AppLayout requiredRole="owner" />}>
              <Route index element={<Dashboard />} />
            </Route>
            <Route path="/hoardings" element={<AppLayout requiredRole="owner" />}>
              <Route index element={<Hoardings />} />
            </Route>
            <Route path="/photographers" element={<AppLayout requiredRole="owner" />}>
              <Route index element={<Photographers />} />
            </Route>
            <Route path="/clients" element={<AppLayout requiredRole="owner" />}>
              <Route index element={<Clients />} />
            </Route>
            <Route path="/contracts" element={<AppLayout requiredRole="owner" />}>
              <Route index element={<Contracts />} />
            </Route>
            <Route path="/billings" element={<AppLayout requiredRole="owner" />}>
              <Route index element={<Billings />} />
            </Route>
            <Route path="/photos" element={<AppLayout requiredRole="owner" />}>
              <Route index element={<Photos />} />
            </Route>
            <Route path="/analytics" element={<AppLayout requiredRole="owner" />}>
              <Route index element={<Analytics />} />
            </Route>
            <Route path="/settings" element={<AppLayout requiredRole="owner" />}>
              <Route index element={<Settings />} />
            </Route>

            {/* Photographer routes */}
            <Route path="/photographer" element={<AppLayout requiredRole="photographer" />}>
              <Route index element={<PhotographerDashboard />} />
            </Route>
            <Route path="/photographer/assignments" element={<AppLayout requiredRole="photographer" />}>
              <Route index element={<PhotographerAssignments />} />
            </Route>
            <Route path="/photographer/assignment-details/:id" element={<AppLayout requiredRole="photographer" />}>
              <Route index element={<AssignmentDetails />} />
            </Route>
            <Route path="/photographer/upload" element={<AppLayout requiredRole="photographer" />}>
              <Route index element={<PhotoUpload />} />
            </Route>
            <Route path="/photographer/history" element={<AppLayout requiredRole="photographer" />}>
              <Route index element={<PhotoHistory />} />
            </Route>
            <Route path="/photographer/settings" element={<AppLayout requiredRole="photographer" />}>
              <Route index element={<PhotographerSettings />} />
            </Route>

            {/* Client routes */}
            <Route path="/client" element={<AppLayout requiredRole="client" />}>
              <Route index element={<ClientDashboard />} />
            </Route>
            <Route path="/client/hoardings" element={<AppLayout requiredRole="client" />}>
              <Route index element={<ClientHoardings />} />
            </Route>
            <Route path="/client/photos" element={<AppLayout requiredRole="client" />}>
              <Route index element={<ClientPhotos />} />
            </Route>
            <Route path="/client/contracts" element={<AppLayout requiredRole="client" />}>
              <Route index element={<ClientContracts />} />
            </Route>
            <Route path="/client/billing" element={<AppLayout requiredRole="client" />}>
              <Route index element={<ClientBilling />} />
            </Route>
            <Route path="/client/settings" element={<AppLayout requiredRole="client" />}>
              <Route index element={<ClientSettings />} />
            </Route>

            {/* Index route - intelligent routing based on auth state */}
            <Route path="/" element={<Index />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
