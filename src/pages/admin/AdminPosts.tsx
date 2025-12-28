import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Image, X, Clock, Eye, FileText, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  subtitle: string | null;
  image_url: string | null;
  post_type: string;
  featured: boolean;
  breaking: boolean;
  created_at: string;
  reading_time: number;
  view_count: number;
  status: string;
}

type PostStatus = "draft" | "published";

// All available post types
const POST_TYPES = [
  "news",
  "blog",
  "announcement",
  "post",
  "politics",
  "tech",
  "entertainment",
  "world",
  "opinion",
  "sports",
  "business",
  "lifestyle",
  "health",
] as const;

type PostType = typeof POST_TYPES[number];

const AdminPosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    post_type: "post" as PostType,
    status: "published" as PostStatus,
    featured: false,
    breaking: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPosts(data as Post[]);
    }
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.content.length < 200) {
      toast({
        title: "Content too short",
        description: "Post content must be at least 200 characters",
        variant: "destructive",
      });
      return;
    }

    // Require image for featured posts
    if (formData.featured && !imagePreview && !editingPost?.image_url) {
      toast({
        title: "Image required",
        description: "Featured posts require a cover image",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = editingPost?.image_url || null;

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const postData = {
        title: formData.title,
        subtitle: formData.subtitle || null,
        content: formData.content,
        excerpt: formData.content.slice(0, 150),
        post_type: formData.post_type,
        status: formData.status,
        featured: formData.featured,
        breaking: formData.breaking,
        image_url: imageUrl,
        author_id: user.id,
      };

      if (editingPost) {
        const { error } = await supabase
          .from("posts")
          .update(postData)
          .eq("id", editingPost.id);

        if (error) throw error;
        toast({ title: "Post updated successfully" });
      } else {
        const { error } = await supabase.from("posts").insert(postData);
        if (error) throw error;
        toast({ title: "Post created successfully" });
      }

      resetForm();
      fetchPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      subtitle: post.subtitle || "",
      content: post.content,
      post_type: post.post_type as PostType,
      status: (post.status || "published") as PostStatus,
      featured: post.featured,
      breaking: post.breaking || false,
    });
    setImagePreview(post.image_url);
    setShowForm(true);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (!error) {
      toast({ title: "Post deleted" });
      fetchPosts();
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingPost(null);
    setFormData({
      title: "",
      subtitle: "",
      content: "",
      post_type: "post",
      status: "published",
      featured: false,
      breaking: false,
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      news: "bg-red-500/10 text-red-600 border-red-500/20",
      blog: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      announcement: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      politics: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      tech: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
      entertainment: "bg-pink-500/10 text-pink-600 border-pink-500/20",
      world: "bg-green-500/10 text-green-600 border-green-500/20",
      opinion: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      sports: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      business: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      lifestyle: "bg-rose-500/10 text-rose-600 border-rose-500/20",
      health: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    };
    return colors[type] || "bg-primary/10 text-primary border-primary/20";
  };

  const getStatusColor = (status: string) => {
    return status === "published"
      ? "bg-green-500/10 text-green-600 border-green-500/20"
      : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Posts</h1>
          <p className="text-muted-foreground">Manage your blog posts</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      {/* Post Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingPost ? "Edit Post" : "Create Post"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Post title"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Subtitle (optional)</label>
                  <Input
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    placeholder="Brief summary or tagline"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Content (min 200 characters)
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Write your post content..."
                    className="w-full h-48 px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.content.length} / 200 characters minimum
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select
                      value={formData.post_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, post_type: value as PostType })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border rounded-xl shadow-lg">
                        {POST_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className="capitalize cursor-pointer">
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value as PostStatus })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border rounded-xl shadow-lg">
                        <SelectItem value="published" className="cursor-pointer">Published</SelectItem>
                        <SelectItem value="draft" className="cursor-pointer">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, featured: !!checked })
                      }
                    />
                    <label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                      Featured post {formData.featured && "(requires cover image)"}
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="breaking"
                      checked={formData.breaking}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, breaking: !!checked })
                      }
                    />
                    <label htmlFor="breaking" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                      <Zap className="w-4 h-4 text-destructive" />
                      Breaking News
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Cover Image</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl cursor-pointer hover:bg-secondary/80 transition-colors">
                      <Image className="w-4 h-4" />
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {imagePreview && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting
                      ? "Saving..."
                      : editingPost
                      ? "Update Post"
                      : "Create Post"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <div className="flex">
              {post.image_url ? (
                <div className="w-32 h-32 flex-shrink-0 relative">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  {post.breaking && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold">
                      <Zap className="w-2.5 h-2.5" />
                      BREAKING
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-32 h-32 flex-shrink-0 bg-muted flex items-center justify-center relative">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                  {post.breaking && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold">
                      <Zap className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
              )}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline" className={cn("text-xs capitalize", getTypeColor(post.post_type))}>
                        {post.post_type}
                      </Badge>
                      <Badge variant="outline" className={cn("text-xs", getStatusColor(post.status || "published"))}>
                        {post.status || "published"}
                      </Badge>
                      {post.featured && (
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                          Featured
                        </Badge>
                      )}
                      {post.breaking && (
                        <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                          Breaking
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-1">
                      {post.title}
                    </h3>
                    {post.subtitle && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{post.subtitle}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.reading_time || 1} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.view_count || 0} views
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(post)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(post.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Create your first post!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPosts;
