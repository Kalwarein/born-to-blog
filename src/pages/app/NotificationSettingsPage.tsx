import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, Zap, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NotificationSettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications_enabled: true,
    breaking_news_enabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("user_settings")
      .select("notifications_enabled, breaking_news_enabled")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setSettings({
        notifications_enabled: data.notifications_enabled ?? true,
        breaking_news_enabled: data.breaking_news_enabled ?? true,
      });
    }
    setLoading(false);
  };

  const updateSetting = async (key: keyof typeof settings, value: boolean) => {
    if (!user) return;

    setSettings((prev) => ({ ...prev, [key]: value }));

    const { error } = await supabase
      .from("user_settings")
      .upsert(
        { user_id: user.id, [key]: value },
        { onConflict: "user_id" }
      );

    if (!error) {
      toast({ title: "Settings updated" });
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
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        <Card className="shadow-card border-0">
          <CardContent className="p-0 divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Get notified about new content</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications_enabled}
                onCheckedChange={(value) => updateSetting("notifications_enabled", value)}
              />
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium">Breaking News Alerts</p>
                  <p className="text-sm text-muted-foreground">Important news notifications</p>
                </div>
              </div>
              <Switch
                checked={settings.breaking_news_enabled}
                onCheckedChange={(value) => updateSetting("breaking_news_enabled", value)}
              />
            </div>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground px-1">
          You can manage notification preferences for specific topics in your reading preferences.
        </p>
      </main>
    </div>
  );
};

export default NotificationSettingsPage;