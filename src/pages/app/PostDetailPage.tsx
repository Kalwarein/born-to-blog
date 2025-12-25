import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  MessageCircle,
  Send,
} from "lucide-react";
import PostCard from "@/components/app/PostCard";
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

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: {
    name: string;
    avatar_url: string | null;
  };
}

const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [suggestedPosts, setSuggestedPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
      fetchSuggestedPosts();
      if (user) {
        checkLikeStatus();
        checkSaveStatus();
      }
    }
  }, [id, user]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      setPost(data);
    }

    // Fetch likes count
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", id);

    setLikesCount(count || 0);
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:user_id (name, avatar_url)
      `)
      .eq("post_id", id)
      .order("created_at", { ascending: false });

    if (data) {
      const formattedComments = data.map((comment: any) => ({
        ...comment,
        profile: comment.profiles,
      }));
      setComments(formattedComments);
    }
  };

  const fetchSuggestedPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .neq("id", id)
      .order("created_at", { ascending: false })
      .limit(3);

    if (data) {
      setSuggestedPosts(data);
    }
  };

  const checkLikeStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("post_id", id)
      .maybeSingle();

    setIsLiked(!!data);
  };

  const checkSaveStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_posts")
      .select("id")
      .eq("user_id", user.id)
      .eq("post_id", id)
      .maybeSingle();

    setIsSaved(!!data);
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }

    if (isLiked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", id);
      setIsLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      await supabase.from("likes").insert({ user_id: user.id, post_id: id });
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save posts",
        variant: "destructive",
      });
      return;
    }

    if (isSaved) {
      await supabase.from("saved_posts").delete().eq("user_id", user.id).eq("post_id", id);
      setIsSaved(false);
      toast({ title: "Removed from saved" });
    } else {
      await supabase.from("saved_posts").insert({ user_id: user.id, post_id: id });
      setIsSaved(true);
      toast({ title: "Saved for later" });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          url: url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard" });
    }
  };

  const handleComment = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    const { error } = await supabase.from("comments").insert({
      user_id: user.id,
      post_id: id,
      content: newComment.trim(),
    });

    if (!error) {
      setNewComment("");
      fetchComments();
      toast({ title: "Comment added" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-xl font-semibold mb-4">Post not found</h1>
        <Button onClick={() => navigate("/app")}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare} className="rounded-full">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Post Content */}
      <article className="px-6 py-6">
        {post.image_url && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-6 -mx-2">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-primary bg-secondary px-3 py-1 rounded-lg uppercase tracking-wider">
            {post.post_type}
          </span>
          <span className="text-sm text-muted-foreground">
            {format(new Date(post.created_at), "MMM d, yyyy")}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
          {post.title}
        </h1>

        <div className="mt-6 prose prose-lg max-w-none">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-border">
          <Button
            variant={isLiked ? "default" : "outline"}
            size="sm"
            onClick={handleLike}
            className="gap-2"
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            {likesCount}
          </Button>
          <Button
            variant={isSaved ? "default" : "outline"}
            size="sm"
            onClick={handleSave}
            className="gap-2"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </Button>
        </div>
      </article>

      {/* Comments Section */}
      <section className="px-6 py-6 border-t border-border">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Comments ({comments.length})</h2>
        </div>

        {/* Comment Input */}
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
          />
          <Button size="icon" onClick={handleComment} disabled={!newComment.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground text-sm font-semibold">
                      {comment.profile?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.profile?.name || "User"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-1">{comment.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {comments.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              Be the first to comment
            </p>
          )}
        </div>
      </section>

      {/* Suggested Posts */}
      {suggestedPosts.length > 0 && (
        <section className="px-6 py-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-4">More to read</h2>
          <div className="space-y-4">
            {suggestedPosts.map((suggestedPost) => (
              <PostCard key={suggestedPost.id} post={suggestedPost} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default PostDetailPage;
