import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/app/AppHeader";
import CategoryChips from "@/components/app/CategoryChips";
import CompactPostCard from "@/components/app/CompactPostCard";
import PostCardSkeleton from "@/components/app/PostCardSkeleton";
import { Newspaper, Search } from "lucide-react";

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
  reading_time: number;
  view_count: number;
}

// Article-focused categories for Feed tab (long-form content)
const ARTICLE_CATEGORIES = ["All", "Blog", "Opinion", "Lifestyle", "Announcement"];

const FeedPage = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "All";

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const POSTS_PER_PAGE = 10;

  const fetchPosts = useCallback(async (pageNum: number, search: string = "", category: string = "All") => {
    const from = pageNum * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    // Only show articles/blogs in Feed (long-form content)
    let query = supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .in("post_type", ["blog", "opinion", "lifestyle", "announcement", "post"])
      .order("created_at", { ascending: false });

    if (search.trim()) {
      query = supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .in("post_type", ["blog", "opinion", "lifestyle", "announcement", "post"])
        .or(`title.ilike.%${search}%,content.ilike.%${search}%`)
        .order("created_at", { ascending: false });
    }

    if (category !== "All") {
      query = supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .eq("post_type", category.toLowerCase() as any)
        .order("created_at", { ascending: false });
    }

    const { data, error } = await query.range(from, to);

    if (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
      return;
    }

    if (data) {
      if (pageNum === 0) {
        setPosts(data);
      } else {
        setPosts((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === POSTS_PER_PAGE);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setPage(0);
      setLoading(true);
      fetchPosts(0, searchQuery, selectedCategory);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory, fetchPosts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, searchQuery, selectedCategory);
  };

  return (
    <div className="min-h-screen pb-20">
      <AppHeader showSearch searchValue={searchQuery} onSearchChange={setSearchQuery} />

      {/* Category Chips */}
      <div className="px-4 py-3 border-b border-border">
        <CategoryChips
          categories={ARTICLE_CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Posts */}
      <main className="px-4 py-4">
        {searchQuery && posts.length > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            Found {posts.length} result{posts.length !== 1 ? "s" : ""} for "{searchQuery}"
          </p>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <PostCardSkeleton key={i} variant="compact" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CompactPostCard post={post} />
              </div>
            ))}

            {hasMore && (
              <button
                onClick={loadMore}
                className="w-full py-4 text-primary font-semibold hover:bg-accent rounded-xl transition-colors"
              >
                Load more
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            {searchQuery ? (
              <>
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">No results found</h2>
                <p className="text-muted-foreground">Try a different search term</p>
              </>
            ) : (
              <>
                <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">No articles yet</h2>
                <p className="text-muted-foreground">Check back later for new content!</p>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default FeedPage;