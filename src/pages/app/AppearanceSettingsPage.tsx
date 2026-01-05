import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Moon, Sun, Type, Check, TextCursor, AlignJustify } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const fontSizes = [
  { value: "small", label: "Small", size: "text-sm" },
  { value: "medium", label: "Medium", size: "text-base" },
  { value: "large", label: "Large", size: "text-lg" },
  { value: "xlarge", label: "X-Large", size: "text-xl" },
];

const fontFamilies = [
  { value: "Plus Jakarta Sans", label: "Jakarta Sans", category: "Sans-serif" },
  { value: "Inter", label: "Inter", category: "Sans-serif" },
  { value: "Roboto", label: "Roboto", category: "Sans-serif" },
  { value: "Open Sans", label: "Open Sans", category: "Sans-serif" },
  { value: "Lato", label: "Lato", category: "Sans-serif" },
  { value: "Poppins", label: "Poppins", category: "Sans-serif" },
  { value: "Montserrat", label: "Montserrat", category: "Sans-serif" },
  { value: "Source Sans Pro", label: "Source Sans", category: "Sans-serif" },
  { value: "Nunito", label: "Nunito", category: "Sans-serif" },
  { value: "Raleway", label: "Raleway", category: "Sans-serif" },
  { value: "Ubuntu", label: "Ubuntu", category: "Sans-serif" },
  { value: "Oswald", label: "Oswald", category: "Sans-serif" },
  { value: "Quicksand", label: "Quicksand", category: "Sans-serif" },
  { value: "Merriweather", label: "Merriweather", category: "Serif" },
  { value: "Playfair Display", label: "Playfair", category: "Serif" },
  { value: "Lora", label: "Lora", category: "Serif" },
  { value: "Georgia", label: "Georgia", category: "Serif" },
  { value: "PT Serif", label: "PT Serif", category: "Serif" },
  { value: "Crimson Text", label: "Crimson", category: "Serif" },
  { value: "Libre Baskerville", label: "Baskerville", category: "Serif" },
  { value: "EB Garamond", label: "Garamond", category: "Serif" },
  { value: "Roboto Mono", label: "Roboto Mono", category: "Monospace" },
  { value: "Fira Code", label: "Fira Code", category: "Monospace" },
  { value: "JetBrains Mono", label: "JetBrains", category: "Monospace" },
  { value: "Source Code Pro", label: "Source Code", category: "Monospace" },
];

const lineHeights = [
  { value: "tight", label: "Compact", multiplier: "1.4" },
  { value: "normal", label: "Normal", multiplier: "1.6" },
  { value: "relaxed", label: "Relaxed", multiplier: "1.8" },
  { value: "loose", label: "Spacious", multiplier: "2.0" },
];

const AppearanceSettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [fontSize, setFontSize] = useState("medium");
  const [fontFamily, setFontFamily] = useState("Plus Jakarta Sans");
  const [lineHeight, setLineHeight] = useState("normal");
  const [loading, setLoading] = useState(true);
  const [fontCategory, setFontCategory] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("user_settings")
      .select("font_size, font_family, line_height")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      if (data.font_size) setFontSize(data.font_size);
      if (data.font_family) setFontFamily(data.font_family);
      if (data.line_height) setLineHeight(data.line_height);
    }
    setLoading(false);
  };

  const updateSetting = async (field: string, value: string) => {
    if (!user) return;

    const updateData: Record<string, any> = { user_id: user.id };
    updateData[field] = value;

    const { error } = await supabase
      .from("user_settings")
      .upsert(updateData as any, { onConflict: "user_id" });

    if (!error) {
      toast({ title: "Settings updated" });
    }
  };

  const handleFontSizeChange = (newSize: string) => {
    setFontSize(newSize);
    updateSetting("font_size", newSize);
  };

  const handleFontFamilyChange = (newFont: string) => {
    setFontFamily(newFont);
    updateSetting("font_family", newFont);
  };

  const handleLineHeightChange = (newHeight: string) => {
    setLineHeight(newHeight);
    updateSetting("line_height", newHeight);
  };

  const filteredFonts = fontCategory
    ? fontFamilies.filter((f) => f.category === fontCategory)
    : fontFamilies;

  const categories = ["Sans-serif", "Serif", "Monospace"];

  const getPreviewStyle = () => {
    const sizeMap: Record<string, string> = {
      small: "0.875rem",
      medium: "1rem",
      large: "1.125rem",
      xlarge: "1.25rem",
    };
    const heightMap: Record<string, string> = {
      tight: "1.4",
      normal: "1.6",
      relaxed: "1.8",
      loose: "2.0",
    };
    return {
      fontFamily: fontFamily,
      fontSize: sizeMap[fontSize] || "1rem",
      lineHeight: heightMap[lineHeight] || "1.6",
    };
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
            <span className="text-sm font-medium text-muted-foreground">Text Size</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {fontSizes.map((size) => (
              <button
                key={size.value}
                onClick={() => handleFontSizeChange(size.value)}
                className={cn(
                  "relative p-3 rounded-xl border-2 transition-all",
                  fontSize === size.value
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                {fontSize === size.value && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                )}
                <span className={cn("font-medium text-xs", size.size)}>{size.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <TextCursor className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Font Style</span>
          </div>
          
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFontCategory(null)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                fontCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFontCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                  fontCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Font Grid */}
          <ScrollArea className="h-48">
            <div className="grid grid-cols-3 gap-2 pr-4">
              {filteredFonts.map((font) => (
                <button
                  key={font.value}
                  onClick={() => handleFontFamilyChange(font.value)}
                  className={cn(
                    "relative p-3 rounded-xl border-2 transition-all text-left",
                    fontFamily === font.value
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  {fontFamily === font.value && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                  <span 
                    className="font-medium text-xs block truncate"
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{font.category}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Line Height */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <AlignJustify className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Line Spacing</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {lineHeights.map((height) => (
              <button
                key={height.value}
                onClick={() => handleLineHeightChange(height.value)}
                className={cn(
                  "relative p-3 rounded-xl border-2 transition-all",
                  lineHeight === height.value
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                {lineHeight === height.value && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                )}
                <span className="font-medium text-xs">{height.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3">Live Preview</p>
            <div 
              className="p-4 bg-muted/30 rounded-xl"
              style={getPreviewStyle()}
            >
              <h3 className="font-bold mb-2" style={{ fontFamily: fontFamily }}>
                Breaking: Major Tech Announcement
              </h3>
              <p className="text-foreground">
                This is how your articles will look. Born to Blog brings you the best stories from around the world with customizable reading experience. Adjust the font, size, and spacing to match your preferences.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AppearanceSettingsPage;
