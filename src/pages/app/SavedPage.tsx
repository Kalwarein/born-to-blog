import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PostCard from "@/components/app/PostCard";
import { Bookmark } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  post_type: string;
  featured: boolean;
  created_at: string;
  author_id: string;
}

const SavedPage = () => {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedPosts();
    }
  }, [user]);

  const fetchSavedPosts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("saved_posts")
      .select(`
        post_id,
        posts (*)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching saved posts:", error);
      setLoading(false);
      return;
    }

    if (data) {
      const posts = data
        .map((item: any) => item.posts)
        .filter((post: Post | null) => post !== null) as Post[];
      setSavedPosts(posts);
    }
    setLoading(false);
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
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">Saved Posts</h1>
        </div>
      </header>

      {/* Posts */}
      <main className="px-6 py-6">
        {savedPosts.length > 0 ? (
          <div className="space-y-6">
            {savedPosts.map((post, index) => (
              <div
                key={post.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No saved posts</h2>
            <p className="text-muted-foreground">
              Save articles to read them later
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedPage;
