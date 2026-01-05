import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useReadingSettings } from "@/hooks/useReadingSettings";
import { formatDistanceToNow } from "date-fns";
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
  Volume2,
  VolumeX,
  Pause,
  Play,
  Zap,
  ExternalLink,
} from "lucide-react";
import CompactPostCard from "@/components/app/CompactPostCard";
import ReadingProgressBar from "@/components/app/ReadingProgressBar";
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
  breaking: boolean;
  created_at: string;
  author_id: string;
  reading_time: number;
  view_count: number;
  is_external?: boolean;
  source_name?: string | null;
  external_url?: string | null;
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
  const { getContentStyle } = useReadingSettings();
  const { speak, stop, toggle, isPlaying, isPaused, isSupported } = useTextToSpeech();
  const sessionIdRef = useRef<string>(
    sessionStorage.getItem("session_id") || `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );

  const [post, setPost] = useState<Post | null>(null);
  const [suggestedPosts, setSuggestedPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState("Born to Blog");
  const [publisherId, setPublisherId] = useState<string | null>(null);

  // Store session ID
  useEffect(() => {
    sessionStorage.setItem("session_id", sessionIdRef.current);
  }, []);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
      recordView();
      if (user) {
        checkLikeStatus();
        checkSaveStatus();
      }
    }
    // Stop TTS when leaving page
    return () => stop();
  }, [id, user]);

  // Fetch suggested posts when post is loaded
  useEffect(() => {
    if (post) {
      fetchSuggestedPosts();
    }
  }, [post?.id, post?.post_type]);

  const recordView = async () => {
    if (!id) return;
    // Use the new unique view tracking function
    await supabase.rpc("record_post_view", {
      p_post_id: id,
      p_user_id: user?.id || null,
      p_session_id: user ? null : sessionIdRef.current,
    });
    
    // Add to reading history for logged-in users
    if (user) {
      await supabase.from("reading_history").upsert(
        { user_id: user.id, post_id: id, read_at: new Date().toISOString() },
        { onConflict: "user_id,post_id" }
      );
    }
  };

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      setPost(data as Post);
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
    // First try to get the publisher profile
    const { data: pubData } = await supabase
      .from("publishers")
      .select("id, name")
      .eq("admin_id", authorId)
      .maybeSingle();
    
    if (pubData) {
      setAuthorName(pubData.name || "Born to Blog");
      setPublisherId(pubData.id);
      return;
    }
    
    // Fallback to profile name
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
    if (!post) return;
    
    // Extract keywords from current post title for similarity matching
    const titleWords = post.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3); // Only words with 4+ characters

    // First try to find posts with the same post_type
    const { data: sameTypePosts } = await supabase
      .from("posts")
      .select("*")
      .neq("id", id)
      .eq("status", "published")
      .eq("post_type", post.post_type as any)
      .order("created_at", { ascending: false })
      .limit(10);

    if (sameTypePosts && sameTypePosts.length > 0) {
      // Score posts by keyword similarity
      const scoredPosts = sameTypePosts.map((p: Post) => {
        const pTitleWords = p.title.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
        const pContentWords = (p.content || '').toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
        const allWords = [...pTitleWords, ...pContentWords];
        
        let score = 0;
        titleWords.forEach(word => {
          if (allWords.includes(word)) score += 2; // Title match = 2 points
          if (pTitleWords.includes(word)) score += 3; // Title-to-title match = 3 extra points
        });
        
        // Bonus for same source
        if (post.source_name && p.source_name === post.source_name) score += 5;
        
        return { ...p, score };
      });

      // Sort by score and take top 4
      scoredPosts.sort((a, b) => b.score - a.score);
      setSuggestedPosts(scoredPosts.slice(0, 4) as Post[]);
    } else {
      // Fallback: fetch any recent posts
      const { data: recentPosts } = await supabase
        .from("posts")
        .select("*")
        .neq("id", id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(4);

      if (recentPosts) setSuggestedPosts(recentPosts as Post[]);
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

  const handleReadAloud = () => {
    if (!post) return;
    if (isPlaying && !isPaused) {
      toggle(); // pause
    } else if (isPaused) {
      toggle(); // resume
    } else {
      // Start fresh
      const textToRead = `${post.title}. ${post.subtitle || ""}. ${post.content}`;
      speak(textToRead);
    }
  };

  const handleStopReading = () => {
    stop();
  };

  const postTypeColors: Record<string, string> = {
    news: "bg-blue-500",
    blog: "bg-green-500",
    announcement: "bg-purple-500",
    politics: "bg-rose-500",
    tech: "bg-cyan-500",
    entertainment: "bg-pink-500",
    world: "bg-emerald-500",
    opinion: "bg-orange-500",
    sports: "bg-lime-500",
    business: "bg-indigo-500",
    lifestyle: "bg-fuchsia-500",
    health: "bg-teal-500",
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
      <ReadingProgressBar />
      
      {/* Hero Image */}
      <div className="relative">
        {post.image_url && (
          <div className="aspect-[16/10] w-full">
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        
        {/* Breaking News Badge */}
        {post.breaking && (
          <div className="absolute top-14 left-4 z-30 flex items-center gap-1 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-full text-xs font-bold uppercase animate-pulse">
            <Zap className="w-3 h-3" />
            Breaking
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
            <div className="flex items-center gap-2">
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
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
          {post.is_external && post.source_name ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-bold">
                  {post.source_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium">Source: {post.source_name}</span>
            </div>
          ) : (
            <button 
              onClick={() => publisherId && navigate(`/publisher/${publisherId}`)}
              className="flex items-center gap-2 hover:text-primary transition-colors"
              disabled={!publisherId}
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-medium">{authorName}</span>
            </button>
          )}
          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {post.reading_time} min read
          </span>
        </div>

        {/* Read Original Source Button for External News */}
        {post.is_external && post.external_url && (
          <a
            href={post.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Read original source
          </a>
        )}

        {/* Read Aloud Button */}
        {isSupported && (
          <div className="flex items-center gap-2 mb-6">
            <Button
              variant={isPlaying ? "default" : "outline"}
              size="sm"
              onClick={handleReadAloud}
              className="gap-2"
            >
              {isPlaying && !isPaused ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : isPaused ? (
                <>
                  <Play className="w-4 h-4" />
                  Resume
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  Listen
                </>
              )}
            </Button>
            {(isPlaying || isPaused) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStopReading}
                className="gap-2"
              >
                <VolumeX className="w-4 h-4" />
                Stop
              </Button>
            )}
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <div 
            className="text-foreground whitespace-pre-wrap"
            style={getContentStyle()}
          >
            {post.content}
          </div>
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
