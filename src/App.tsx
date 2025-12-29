import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

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
import NotificationsPage from "./pages/app/NotificationsPage";
import ReadingHistoryPage from "./pages/app/ReadingHistoryPage";
import AppearanceSettingsPage from "./pages/app/AppearanceSettingsPage";
import NotificationSettingsPage from "./pages/app/NotificationSettingsPage";
import HelpSupportPage from "./pages/app/HelpSupportPage";
import AboutPage from "./pages/app/AboutPage";
import PublisherPage from "./pages/app/PublisherPage";

// Admin Layout & Pages
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminPublisherEdit from "./pages/admin/AdminPublisherEdit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Splash />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/publisher/:id" element={<PublisherPage />} />

              {/* User App Routes */}
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="feed" element={<FeedPage />} />
                <Route path="saved" element={<SavedPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="post/:id" element={<PostDetailPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="reading-history" element={<ReadingHistoryPage />} />
                <Route path="appearance-settings" element={<AppearanceSettingsPage />} />
                <Route path="notification-settings" element={<NotificationSettingsPage />} />
                <Route path="help-support" element={<HelpSupportPage />} />
                <Route path="about" element={<AboutPage />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="posts" element={<AdminPosts />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="logs" element={<AdminLogs />} />
                <Route path="publisher" element={<AdminPublisherEdit />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;