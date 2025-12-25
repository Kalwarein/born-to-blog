import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PostCard from "@/components/app/PostCard";
import { Sparkles, TrendingUp } from "lucide-react";

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

const HomePage = () => {
  const { user } = useAuth();
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchUserName();
    }
  }, [user]);

  const fetchUserName = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data?.name) {
      setUserName(data.name);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    
    // Fetch featured posts
    const { data: featured } = await supabase
      .from("posts")
      .select("*")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(3);

    // Fetch recent posts
    const { data: recent } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6);

    setFeaturedPosts(featured || []);
    setRecentPosts(recent || []);
    setLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
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
      <header className="gradient-hero px-6 pt-8 pb-6">
        <p className="text-muted-foreground font-medium">{getGreeting()}</p>
        <h1 className="text-2xl font-bold text-foreground">
          {userName || "Reader"} 👋
        </h1>
      </header>

      {/* Featured Section */}
      {featuredPosts.length > 0 && (
        <section className="px-6 py-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Featured</h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory">
            {featuredPosts.map((post) => (
              <div key={post.id} className="flex-shrink-0 w-72 snap-start">
                <PostCard post={post} variant="featured" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Posts */}
      <section className="px-6 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Recent Posts</h2>
        </div>
        
        {recentPosts.length > 0 ? (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Check back later!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
