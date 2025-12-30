import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Bell, Plus, Trash2, Send } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  link_type: string | null;
  link_value: string | null;
  created_at: string;
}

const AdminNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    link_type: "",
    link_value: "",
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    setNotifications((data as Notification[]) || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Error",
        description: "Title and message are required",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("notifications").insert({
      title: formData.title,
      message: formData.message,
      link_type: formData.link_type || null,
      link_value: formData.link_value || null,
      created_by: user?.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Notification sent!" });
    setFormData({ title: "", message: "", link_type: "", link_value: "" });
    setIsCreating(false);
    fetchNotifications();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("notifications").delete().eq("id", id);

    if (!error) {
      toast({ title: "Notification deleted" });
      fetchNotifications();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Send announcements to all users</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Notification
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Notification title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Message content"
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                value={formData.link_type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, link_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Link type (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="external">External URL</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Link value (post ID, URL, etc.)"
                value={formData.link_value}
                onChange={(e) => setFormData((prev) => ({ ...prev, link_value: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Send Notification</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                        {notification.link_type && (
                          <span className="px-2 py-0.5 bg-secondary rounded-full capitalize">
                            {notification.link_type}: {notification.link_value}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(notification.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-xl">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No notifications sent yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;