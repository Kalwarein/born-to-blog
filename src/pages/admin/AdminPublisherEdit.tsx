import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Camera, Save, ExternalLink } from "lucide-react";

interface Publisher {
  id: string;
  admin_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  contact_email: string | null;
  social_links: unknown;
}

const AdminPublisherEdit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contact_email: "",
    twitter: "",
    linkedin: "",
    website: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPublisher();
    }
  }, [user]);

  const fetchPublisher = async () => {
    const { data, error } = await supabase
      .from("publishers")
      .select("*")
      .eq("admin_id", user?.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching publisher:", error);
    }

    if (data) {
      setPublisher(data as Publisher);
      const socialLinks = (typeof data.social_links === 'object' && data.social_links !== null ? data.social_links : {}) as Record<string, string>;
      setFormData({
        name: data.name || "",
        description: data.description || "",
        contact_email: data.contact_email || "",
        twitter: socialLinks.twitter || "",
        linkedin: socialLinks.linkedin || "",
        website: socialLinks.website || "",
      });
      setLogoPreview(data.logo_url);
      setBannerPreview(data.banner_url);
    }
    setLoading(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File, type: "logo" | "banner"): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${user?.id}/${type}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("publisher-images")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data } = supabase.storage.from("publisher-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      let logoUrl = publisher?.logo_url || null;
      let bannerUrl = publisher?.banner_url || null;

      if (logoFile) {
        const url = await uploadImage(logoFile, "logo");
        if (url) logoUrl = url;
      }

      if (bannerFile) {
        const url = await uploadImage(bannerFile, "banner");
        if (url) bannerUrl = url;
      }

      const publisherData = {
        admin_id: user.id,
        name: formData.name,
        description: formData.description || null,
        contact_email: formData.contact_email || null,
        logo_url: logoUrl,
        banner_url: bannerUrl,
        social_links: {
          twitter: formData.twitter || null,
          linkedin: formData.linkedin || null,
          website: formData.website || null,
        },
      };

      if (publisher) {
        const { error } = await supabase
          .from("publishers")
          .update(publisherData)
          .eq("id", publisher.id);

        if (error) throw error;
        toast.success("Publisher profile updated!");
      } else {
        const { error } = await supabase
          .from("publishers")
          .insert(publisherData);

        if (error) throw error;
        toast.success("Publisher profile created!");
      }

      fetchPublisher();
    } catch (error) {
      console.error("Error saving publisher:", error);
      toast.error("Failed to save publisher profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = formData.name
    ? formData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "PB";

  return (
    <div className="p-6 md:p-0 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Publisher Profile</h1>
        <p className="text-muted-foreground">Manage your public publisher profile</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Banner Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="h-40 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 relative overflow-hidden cursor-pointer group"
              style={bannerPreview ? { backgroundImage: `url(${bannerPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              onClick={() => document.getElementById("banner-upload")?.click()}
            >
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <input
              id="banner-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
            />
            <p className="text-xs text-muted-foreground mt-2">Recommended: 1200 x 400px</p>
          </CardContent>
        </Card>

        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Logo</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div 
              className="relative cursor-pointer group"
              onClick={() => document.getElementById("logo-upload")?.click()}
            >
              <Avatar className="w-24 h-24 border-2 border-border">
                <AvatarImage src={logoPreview || undefined} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
            <div>
              <p className="text-sm font-medium text-foreground">Publisher Logo</p>
              <p className="text-xs text-muted-foreground">Click to upload (recommended: 400 x 400px)</p>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Publisher Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your publisher name"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="description">About / Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell readers about yourself..."
                rows={4}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="contact@example.com"
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input
                id="twitter"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="https://twitter.com/username"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          {publisher && (
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/publisher/${publisher.id}`)}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Public Profile
            </Button>
          )}
          <Button type="submit" disabled={saving} className="gap-2 ml-auto">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminPublisherEdit;
