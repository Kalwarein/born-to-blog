import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ReadingSettings {
  fontSize: string;
  fontFamily: string;
  lineHeight: string;
}

const defaultSettings: ReadingSettings = {
  fontSize: "medium",
  fontFamily: "Plus Jakarta Sans",
  lineHeight: "normal",
};

export const useReadingSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ReadingSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSettings();
    } else {
      // Try to get from localStorage for non-logged users
      const cached = localStorage.getItem("readingSettings");
      if (cached) {
        setSettings(JSON.parse(cached));
      }
      setLoading(false);
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("user_settings")
      .select("font_size, font_family, line_height")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      const newSettings = {
        fontSize: data.font_size || defaultSettings.fontSize,
        fontFamily: data.font_family || defaultSettings.fontFamily,
        lineHeight: data.line_height || defaultSettings.lineHeight,
      };
      setSettings(newSettings);
      localStorage.setItem("readingSettings", JSON.stringify(newSettings));
    }
    setLoading(false);
  };

  const getContentStyle = (): React.CSSProperties => {
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
      fontFamily: settings.fontFamily,
      fontSize: sizeMap[settings.fontSize] || "1rem",
      lineHeight: heightMap[settings.lineHeight] || "1.6",
    };
  };

  return {
    settings,
    loading,
    getContentStyle,
  };
};
