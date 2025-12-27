import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/app/AppHeader";
import CategoryChips from "@/components/app/CategoryChips";
import FeaturedCard from "@/components/app/FeaturedCard";
import CompactPostCard from "@/components/app/CompactPostCard";
import PostCardSkeleton from "@/components/app/PostCardSkeleton";
import { TrendingUp, Clock } from "lucide-react";

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

const CATEGORIES = ["All", "News", "Blog", "Announcement"];

const HomePage = () => {
  const navigate = useNavigate();
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);

    // Fetch trending posts (most viewed, published only)
    const { data: trending } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("view_count", { ascending: false })
      .limit(5);

    // Fetch latest posts (published only)
    let latestQuery = supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(10);

    if (selectedCategory !== "All") {
      latestQuery = latestQuery.eq("post_type", selectedCategory.toLowerCase() as "news" | "blog" | "announcement" | "post");
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

      {/* Category Chips */}
      <div className="px-4 py-3">
        <CategoryChips
          categories={CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Trending Section */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Trending</h2>
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
            {trendingPosts.map((post) => (
              <div key={post.id} className="flex-shrink-0 w-72 snap-start">
                <FeaturedCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/30 rounded-2xl">
            <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No trending posts yet</p>
          </div>
        )}
      </section>

      {/* Latest Section */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Latest</h2>
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
            <h3 className="font-semibold text-foreground mb-1">No posts yet</h3>
            <p className="text-muted-foreground text-sm">Check back later for new content!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;