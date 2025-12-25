import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Image, X } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  post_type: string;
  featured: boolean;
  created_at: string;
}

const AdminPosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    post_type: "post" as "blog" | "post",
    featured: false,
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
      setPosts(data);
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
        content: formData.content,
        excerpt: formData.content.slice(0, 150),
        post_type: formData.post_type,
        featured: formData.featured,
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
      content: post.content,
      post_type: post.post_type as "blog" | "post",
      featured: post.featured,
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
      content: "",
      post_type: "post",
      featured: false,
    });
    setImageFile(null);
    setImagePreview(null);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-0">
      <div className="flex items-center justify-between mb-8">
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
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <select
                      value={formData.post_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          post_type: e.target.value as "blog" | "post",
                        })
                      }
                      className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
                    >
                      <option value="post">Post</option>
                      <option value="blog">Blog</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) =>
                        setFormData({ ...formData, featured: e.target.checked })
                      }
                      className="w-5 h-5 rounded border-2 border-input accent-primary"
                    />
                    <label htmlFor="featured" className="text-sm font-medium">
                      Featured post
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Image</label>
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
              {post.image_url && (
                <div className="w-32 h-32 flex-shrink-0">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-primary bg-secondary px-2 py-0.5 rounded uppercase">
                        {post.post_type}
                      </span>
                      {post.featured && (
                        <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-1">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {post.excerpt}
                    </p>
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
