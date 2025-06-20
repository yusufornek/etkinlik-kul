
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

// Pages
import Index from "./pages/Index";
import EventDetail from "./pages/EventDetail";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminStories from "./pages/admin/AdminStories";
import AdminSettings from "./pages/admin/AdminSettings";
// New Page Imports
import ClubsListPage from './pages/clubs/index';
import ClubDetailPage from './pages/clubs/[id]';
import ClubDashboardPage from './pages/club-dashboard/index';
import AdminPendingRequestsPage from './pages/admin/AdminPendingRequests';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/hakkinda" element={<About />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="stories" element={<AdminStories />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="pending-requests" element={<AdminPendingRequestsPage />} /> {/* New admin route */}
            </Route>
            
            {/* Club related public routes */}
            <Route path="/clubs" element={<ClubsListPage />} />
            <Route path="/clubs/:id" element={<ClubDetailPage />} />

            {/* Club Dashboard - can be protected later */}
            {/* Example of protecting it if ProtectedRoute can handle general logged-in user or specific roles */}
            {/* <Route path="/club-dashboard" element={<ProtectedRoute><ClubDashboardPage /></ProtectedRoute>} /> */}
            <Route path="/club-dashboard" element={<ClubDashboardPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
