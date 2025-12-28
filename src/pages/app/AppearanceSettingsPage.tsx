import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Moon, Sun, Type, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const fontSizes = [
  { value: "small", label: "Small", size: "text-sm" },
  { value: "medium", label: "Medium", size: "text-base" },
  { value: "large", label: "Large", size: "text-lg" },
];

const AppearanceSettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [fontSize, setFontSize] = useState("medium");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("user_settings")
      .select("font_size")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data?.font_size) {
      setFontSize(data.font_size);
    }
    setLoading(false);
  };

  const updateFontSize = async (newSize: string) => {
    if (!user) return;
    setFontSize(newSize);

    const { error } = await supabase
      .from("user_settings")
      .upsert(
        { user_id: user.id, font_size: newSize },
        { onConflict: "user_id" }
      );

    if (!error) {
      toast({ title: "Font size updated" });
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
          <h1 className="text-xl font-bold">Appearance</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Theme Toggle */}
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                  {theme === "dark" ? (
                    <Moon className="w-5 h-5 text-secondary-foreground" />
                  ) : (
                    <Sun className="w-5 h-5 text-secondary-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    {theme === "dark" ? "Currently on" : "Currently off"}
                  </p>
                </div>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        {/* Font Size */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Type className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Font Size</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {fontSizes.map((size) => (
              <button
                key={size.value}
                onClick={() => updateFontSize(size.value)}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all",
                  fontSize === size.value
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                {fontSize === size.value && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <span className={cn("font-medium", size.size)}>{size.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Preview</p>
            <p className={cn("text-foreground", fontSizes.find(f => f.value === fontSize)?.size)}>
              This is how your articles will look. Born to Blog brings you the best stories from around the world.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AppearanceSettingsPage;