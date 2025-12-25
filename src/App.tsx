import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Splash from "./pages/Splash";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// App Layout & Pages
import AppLayout from "./layouts/AppLayout";
import HomePage from "./pages/app/HomePage";
import FeedPage from "./pages/app/FeedPage";
import SavedPage from "./pages/app/SavedPage";
import ProfilePage from "./pages/app/ProfilePage";
import PostDetailPage from "./pages/app/PostDetailPage";

// Admin Layout & Pages
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLogs from "./pages/admin/AdminLogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Splash />} />
            <Route path="/auth" element={<Auth />} />

            {/* User App Routes */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="feed" element={<FeedPage />} />
              <Route path="saved" element={<SavedPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="post/:id" element={<PostDetailPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="posts" element={<AdminPosts />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="logs" element={<AdminLogs />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
