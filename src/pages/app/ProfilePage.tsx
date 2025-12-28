import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  User,
  Shield,
  Bookmark,
  Clock,
  Bell,
  Palette,
  Lock,
  HelpCircle,
  Info,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
} from "lucide-react";
import ProfileMenuItem from "@/components/profile/ProfileMenuItem";
import ProfileMenuSection from "@/components/profile/ProfileMenuSection";
import { Switch } from "@/components/ui/switch";

interface Profile {
  name: string;
  email: string;
  avatar_url: string | null;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("name, email, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) setProfile(data);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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
      {/* Profile Header */}
      <header className="gradient-hero px-6 pt-8 pb-10">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-orange flex-shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-primary-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">
              {profile?.name || "User"}
            </h1>
            <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary bg-secondary px-2 py-0.5 rounded-full">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Menu Sections */}
      <main className="px-4 -mt-4 space-y-5">
        {/* Admin Section */}
        {isAdmin && (
          <ProfileMenuSection>
            <ProfileMenuItem
              icon={Shield}
              label="Admin Dashboard"
              sublabel="Manage posts and users"
              onClick={() => navigate("/admin")}
              iconBgClass="gradient-primary"
            />
          </ProfileMenuSection>
        )}

        {/* Content Section */}
        <ProfileMenuSection title="Your Content">
          <ProfileMenuItem
            icon={Bookmark}
            label="Saved Articles"
            sublabel="View your bookmarks"
            onClick={() => navigate("/app/saved")}
          />
          <ProfileMenuItem
            icon={Clock}
            label="Reading History"
            sublabel="Recently viewed posts"
            onClick={() => navigate("/app/reading-history")}
          />
        </ProfileMenuSection>

        {/* Settings Section */}
        <ProfileMenuSection title="Settings">
          <ProfileMenuItem
            icon={Bell}
            label="Notifications"
            sublabel="Manage alerts"
            onClick={() => navigate("/app/notification-settings")}
          />
          <ProfileMenuItem
            icon={Palette}
            label="Appearance"
            sublabel={`${theme === "dark" ? "Dark" : "Light"} mode`}
            onClick={() => navigate("/app/appearance-settings")}
            rightElement={
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Sun className="w-4 h-4 text-muted-foreground" />
                )}
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              </div>
            }
          />
        </ProfileMenuSection>

        {/* Support Section */}
        <ProfileMenuSection title="Support">
          <ProfileMenuItem
            icon={HelpCircle}
            label="Help & Support"
            sublabel="FAQs and contact"
            onClick={() => navigate("/app/help-support")}
          />
          <ProfileMenuItem
            icon={Info}
            label="About Born to Blog"
            sublabel="Version 1.0.0"
            onClick={() => navigate("/app/about")}
          />
        </ProfileMenuSection>

        {/* Sign Out */}
        <ProfileMenuSection>
          <ProfileMenuItem
            icon={LogOut}
            label="Sign Out"
            onClick={handleSignOut}
            destructive
          />
        </ProfileMenuSection>
      </main>
    </div>
  );
};

export default ProfilePage;