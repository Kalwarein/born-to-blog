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
  Clock,
  Eye,
  User,
} from "lucide-react";
import CompactPostCard from "@/components/app/CompactPostCard";
import { Input } from "@/components/ui/input";

interface Post {
  id: string;
  title: string;
  subtitle: string | null;
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
  const [authorName, setAuthorName] = useState("Born to Blog");

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
      fetchSuggestedPosts();
      incrementViewCount();
      if (user) {
        checkLikeStatus();
        checkSaveStatus();
      }
    }
  }, [id, user]);

  const incrementViewCount = async () => {
    if (!id) return;
    await supabase.rpc("increment_view_count", { post_id: id });
  };

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      setPost(data);
      fetchAuthorName(data.author_id);
    }

    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", id);

    setLikesCount(count || 0);
    setLoading(false);
  };

  const fetchAuthorName = async (authorId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", authorId)
      .maybeSingle();
    if (data?.name) setAuthorName(data.name);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select(`*, profiles:user_id (name, avatar_url)`)
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
      .eq("status", "published")
      .order("view_count", { ascending: false })
      .limit(4);

    if (data) setSuggestedPosts(data);
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
      toast({ title: "Sign in required", description: "Please sign in to like posts", variant: "destructive" });
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
      toast({ title: "Sign in required", description: "Please sign in to save posts", variant: "destructive" });
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
        await navigator.share({ title: post?.title, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard" });
    }
  };

  const handleComment = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to comment", variant: "destructive" });
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

  const postTypeColors: Record<string, string> = {
    news: "bg-blue-500",
    blog: "bg-green-500",
    announcement: "bg-purple-500",
    post: "bg-primary",
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
      {/* Hero Image */}
      <div className="relative">
        {post.image_url && (
          <div className="aspect-[16/10] w-full">
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        
        {/* Floating Header */}
        <div className="absolute top-0 left-0 right-0 z-40 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full bg-background/80 backdrop-blur-lg shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleShare}
              className="rounded-full bg-background/80 backdrop-blur-lg shadow-md"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Floating Like Button */}
        <Button
          size="icon"
          onClick={handleLike}
          className={`absolute -bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-30 ${
            isLiked ? "bg-primary" : "bg-blue-500"
          }`}
        >
          <Heart className={`w-6 h-6 text-white ${isLiked ? "fill-current" : ""}`} />
        </Button>
      </div>

      {/* Content */}
      <article className="px-6 pt-10 pb-6">
        {/* Category Badge */}
        <span className={`inline-block px-3 py-1 ${postTypeColors[post.post_type] || postTypeColors.post} text-white text-xs font-semibold rounded-full uppercase tracking-wide mb-4`}>
          {post.post_type}
        </span>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-3">
          {post.title}
        </h1>

        {/* Subtitle */}
        {post.subtitle && (
          <p className="text-lg text-muted-foreground mb-4">{post.subtitle}</p>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-medium">{authorName}</span>
          </div>
          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {post.reading_time} min read
          </span>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap text-base">
            {post.content}
          </p>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.view_count || 0} views
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {likesCount} likes
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {comments.length} comments
            </span>
          </div>
          
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

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
            className="bg-muted/50 border-0"
          />
          <Button size="icon" onClick={handleComment} disabled={!newComment.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="border-0 shadow-card">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground text-sm font-semibold">
                      {comment.profile?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.profile?.name || "User"}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-1">{comment.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {comments.length === 0 && (
            <p className="text-muted-foreground text-center py-8">Be the first to comment</p>
          )}
        </div>
      </section>

      {/* Suggested Posts */}
      {suggestedPosts.length > 0 && (
        <section className="px-6 py-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-4">More to read</h2>
          <div className="space-y-3">
            {suggestedPosts.map((suggestedPost) => (
              <CompactPostCard key={suggestedPost.id} post={suggestedPost} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default PostDetailPage;