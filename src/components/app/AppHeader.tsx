import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.jpg";

interface AppHeaderProps {
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  title?: string;
}

const AppHeader = ({ showSearch = false, searchValue = "", onSearchChange, title }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchNotificationCount();
    if (user) fetchUserName();
  }, [user]);

  const fetchNotificationCount = async () => {
    // Get total notifications count
    const { data: allNotifications } = await supabase
      .from("notifications")
      .select("id");

    if (!allNotifications) {
      setUnreadCount(0);
      return;
    }

    // If user is logged in, get their read notifications
    if (user) {
      const { data: readNotifications } = await supabase
        .from("user_notification_reads")
        .select("notification_id")
        .eq("user_id", user.id);

      const readIds = new Set(readNotifications?.map(r => r.notification_id) || []);
      const unreadNotifications = allNotifications.filter(n => !readIds.has(n.id));
      setUnreadCount(unreadNotifications.length);
    } else {
      // For non-logged in users, show total count
      setUnreadCount(allNotifications.length);
    }
  };

  const fetchUserName = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data?.name) setUserName(data.name);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="px-4 py-3">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
              <img src={logo} alt="Born to Blog" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{getGreeting()}</p>
              <h1 className="text-lg font-bold text-foreground">{userName || "Reader"}</h1>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full"
            onClick={() => navigate("/app/notifications")}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 pr-10 h-11 bg-muted/50 border-0 rounded-xl"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange?.("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;