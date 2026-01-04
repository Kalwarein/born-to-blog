import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/app/AppHeader";
import CategoryChips from "@/components/app/CategoryChips";
import FeaturedCard from "@/components/app/FeaturedCard";
import CompactPostCard from "@/components/app/CompactPostCard";
import PostCardSkeleton from "@/components/app/PostCardSkeleton";
import { TrendingUp, Clock, Zap } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  subtitle: string | null;
  image_url: string | null;
  post_type: string;
  featured: boolean;
  breaking?: boolean;
  created_at: string;
  author_id: string;
  reading_time: number;
  view_count: number;
  status: string;
  is_external?: boolean;
  source_name?: string | null;
  external_url?: string | null;
}

// News-only categories for Home tab
const NEWS_CATEGORIES = ["All", "News", "Politics", "World", "Business", "Sports", "Entertainment", "Tech", "Health"];

const HomePage = () => {
  const navigate = useNavigate();
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [breakingNews, setBreakingNews] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBreaking, setShowBreaking] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);

    // Fetch breaking news first (only news types)
    const { data: breaking } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .eq("breaking", true)
      .in("post_type", ["news", "politics", "world", "business", "sports", "entertainment", "tech", "health"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (breaking) {
      setBreakingNews(breaking as Post);
    }

    // Fetch trending posts (most viewed NEWS ONLY - latest 5)
    const { data: trending } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .in("post_type", ["news", "politics", "world", "business", "sports", "entertainment", "tech", "health"])
      .order("view_count", { ascending: false })
      .limit(5);

    // Fetch latest news posts (NEWS ONLY)
    let latestQuery = supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .in("post_type", ["news", "politics", "world", "business", "sports", "entertainment", "tech", "health"])
      .order("created_at", { ascending: false })
      .limit(10);

    if (selectedCategory !== "All") {
      latestQuery = supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .eq("post_type", selectedCategory.toLowerCase() as any)
        .order("created_at", { ascending: false })
        .limit(10);
    }

    const { data: latest } = await latestQuery;

    setTrendingPosts((trending as Post[]) || []);
    setLatestPosts((latest as Post[]) || []);
    setLoading(false);
  }, [selectedCategory]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      navigate(`/app/feed?search=${encodeURIComponent(value)}`);
    }
  };

  return (
    <div className="min-h-screen pb-4">
      <AppHeader showSearch searchValue={searchQuery} onSearchChange={handleSearch} />

      {/* Breaking News Banner */}
      {breakingNews && showBreaking && (
        <div className="mx-4 mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-xl relative animate-fade-in">
          <button
            onClick={() => setShowBreaking(false)}
            className="absolute top-2 right-2 text-destructive hover:text-destructive/80 text-lg font-bold"
          >
            ×
          </button>
          <button
            onClick={() => navigate(`/app/post/${breakingNews.id}`)}
            className="w-full text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-destructive animate-pulse" />
              <span className="text-xs font-bold text-destructive uppercase">Breaking News</span>
            </div>
            <p className="text-sm font-semibold text-foreground line-clamp-2 pr-6">{breakingNews.title}</p>
          </button>
        </div>
      )}

      {/* Category Chips */}
      <div className="px-4 py-3">
        <CategoryChips
          categories={NEWS_CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Trending Section - Only show latest 5 */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Trending News</h2>
          </div>
          <button
            onClick={() => navigate("/app/feed")}
            className="text-sm text-primary font-medium hover:underline"
          >
            View More
          </button>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
            {[1, 2].map((i) => (
              <div key={i} className="flex-shrink-0 w-72 snap-start">
                <PostCardSkeleton variant="featured" />
              </div>
            ))}
          </div>
        ) : trendingPosts.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
            {trendingPosts.slice(0, 5).map((post) => (
              <div key={post.id} className="flex-shrink-0 w-72 snap-start">
                <FeaturedCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/30 rounded-2xl">
            <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No trending news yet</p>
          </div>
        )}
      </section>

      {/* Latest News Section */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Latest News</h2>
          </div>
          <button
            onClick={() => navigate("/app/feed")}
            className="text-sm text-primary font-medium hover:underline"
          >
            View More
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <PostCardSkeleton key={i} variant="compact" />
            ))}
          </div>
        ) : latestPosts.length > 0 ? (
          <div className="space-y-3">
            {latestPosts.map((post) => (
              <CompactPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-2xl">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No news yet</h3>
            <p className="text-muted-foreground text-sm">Check back later for updates!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;