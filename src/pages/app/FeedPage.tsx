import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import PostCard from "@/components/app/PostCard";
import { Newspaper } from "lucide-react";

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
  const POSTS_PER_PAGE = 10;

  const fetchPosts = useCallback(async (pageNum: number) => {
    const from = pageNum * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching posts:", error);
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
    fetchPosts(0);
  }, [fetchPosts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
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
            <Newspaper className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">Feed</h1>
        </div>
      </header>

      {/* Posts */}
      <main className="px-6 py-6">
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
            <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No posts yet</h2>
            <p className="text-muted-foreground">Check back later for new content!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default FeedPage;
