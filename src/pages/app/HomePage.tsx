import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PostCard from "@/components/app/PostCard";
import PostCardSkeleton from "@/components/app/PostCardSkeleton";
import { Sparkles, TrendingUp, Newspaper } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  subtitle: string | null;
  image_url: string | null;
  post_type: string;
  featured: boolean;
  created_at: string;
  author_id: string;
  reading_time: number;
  view_count: number;
  status: string;
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
    
    // Fetch featured posts (published only)
    const { data: featured } = await supabase
      .from("posts")
      .select("*")
      .eq("featured", true)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(3);

    // Fetch recent posts (published only)
    const { data: recent } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(6);

    setFeaturedPosts((featured as Post[]) || []);
    setRecentPosts((recent as Post[]) || []);
    setLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen pb-4">
      {/* Header */}
      <header className="gradient-hero px-6 pt-8 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-sm">
            <Newspaper className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Born to Blog</span>
        </div>
        <p className="text-muted-foreground font-medium">{getGreeting()}</p>
        <h1 className="text-2xl font-bold text-foreground">
          {userName || "Reader"} 👋
        </h1>
      </header>

      {/* Featured Section */}
      <section className="px-6 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Featured</h2>
        </div>
        
        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-72 snap-start">
                <PostCardSkeleton variant="featured" />
              </div>
            ))}
          </div>
        ) : featuredPosts.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
            {featuredPosts.map((post) => (
              <div key={post.id} className="flex-shrink-0 w-72 snap-start">
                <PostCard post={post} variant="featured" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/30 rounded-2xl">
            <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No featured posts yet</p>
          </div>
        )}
      </section>

      {/* Recent Posts */}
      <section className="px-6 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Recent Posts</h2>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : recentPosts.length > 0 ? (
          <div className="space-y-5">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-2xl">
            <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No posts yet</h3>
            <p className="text-muted-foreground text-sm">Check back later for new content!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
