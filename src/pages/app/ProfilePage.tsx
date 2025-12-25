import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, User, Shield, ChevronRight } from "lucide-react";

interface Profile {
  name: string;
  email: string;
  avatar_url: string | null;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("name, email, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
    }
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="gradient-hero px-6 pt-8 pb-12 text-center">
        <div className="w-24 h-24 mx-auto bg-primary rounded-full flex items-center justify-center mb-4 shadow-orange">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-primary-foreground" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {profile?.name || "User"}
        </h1>
        <p className="text-muted-foreground mt-1">{profile?.email}</p>
        {isAdmin && (
          <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary bg-secondary px-3 py-1 rounded-full">
            <Shield className="w-3 h-3" />
            Admin
          </span>
        )}
      </header>

      {/* Options */}
      <main className="px-6 -mt-6">
        <Card>
          <CardContent className="p-0">
            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors rounded-t-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-medium">Admin Dashboard</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </CardContent>
        </Card>

        <Button
          variant="outline"
          size="lg"
          className="w-full mt-6 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>
      </main>
    </div>
  );
};

export default ProfilePage;
