import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Bell, ExternalLink, FileText, Tag, Check } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  link_type: string | null;
  link_value: string | null;
  created_at: string;
  isRead?: boolean;
}

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    // Fetch all notifications
    const { data: notificationsData } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (!notificationsData) {
      setLoading(false);
      return;
    }

    // If user is logged in, fetch their read status
    if (user) {
      const { data: readData } = await supabase
        .from("user_notification_reads")
        .select("notification_id")
        .eq("user_id", user.id);

      const readIds = new Set(readData?.map(r => r.notification_id) || []);

      const notificationsWithReadStatus = notificationsData.map(n => ({
        ...n,
        isRead: readIds.has(n.id)
      }));

      setNotifications(notificationsWithReadStatus as Notification[]);

      // Mark all unread notifications as read
      const unreadNotifications = notificationsData.filter(n => !readIds.has(n.id));
      if (unreadNotifications.length > 0) {
        const inserts = unreadNotifications.map(n => ({
          user_id: user.id,
          notification_id: n.id
        }));
        await supabase.from("user_notification_reads").insert(inserts);
      }
    } else {
      setNotifications(notificationsData as Notification[]);
    }

    setLoading(false);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.link_type || !notification.link_value) return;

    switch (notification.link_type) {
      case "post":
        navigate(`/app/post/${notification.link_value}`);
        break;
      case "category":
        navigate(`/app/feed?category=${notification.link_value}`);
        break;
      case "publisher":
        navigate(`/publisher/${notification.link_value}`);
        break;
      case "external":
        window.open(notification.link_value, "_blank");
        break;
      default:
        break;
    }
  };

  const getLinkIcon = (linkType: string | null) => {
    switch (linkType) {
      case "post":
        return <FileText className="w-4 h-4" />;
      case "category":
        return <Tag className="w-4 h-4" />;
      case "external":
        return <ExternalLink className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-4">
      {/* Header - No bottom tab bar, just back button */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
      </header>

      {/* Notifications List */}
      <main className="px-4 py-4">
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left p-4 rounded-xl shadow-card hover:shadow-md transition-all duration-200 ${
                  notification.isRead 
                    ? "bg-card opacity-70" 
                    : "bg-card border-l-4 border-l-primary"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notification.isRead ? "bg-muted" : "bg-primary/10"
                  }`}>
                    {notification.isRead ? (
                      <Check className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Bell className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                      {notification.link_type && (
                        <span className="flex items-center gap-1 text-primary">
                          {getLinkIcon(notification.link_type)}
                          <span className="capitalize">{notification.link_type}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No notifications yet</h2>
            <p className="text-muted-foreground">Stay tuned for updates!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;