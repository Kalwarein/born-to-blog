import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import PostCard from "@/components/app/PostCard";
import { Newspaper, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

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

const FeedPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const POSTS_PER_PAGE = 10;

  const fetchPosts = useCallback(async (pageNum: number, search: string = "") => {
    setIsSearching(!!search);
    const from = pageNum * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    let query = supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
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
      fetchPosts(0, searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, fetchPosts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">Feed</h1>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </header>

      {/* Posts */}
      <main className="px-6 py-6">
        {isSearching && posts.length > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            Found {posts.length} result{posts.length !== 1 ? "s" : ""} for "{searchQuery}"
          </p>
        )}

        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PostCard post={post} />
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
            {isSearching ? (
              <>
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">No results found</h2>
                <p className="text-muted-foreground">Try a different search term</p>
              </>
            ) : (
              <>
                <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">No posts yet</h2>
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
