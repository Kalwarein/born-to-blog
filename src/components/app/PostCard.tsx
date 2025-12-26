import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Clock, Eye, Heart, MessageCircle, Bookmark } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  subtitle?: string | null;
  image_url: string | null;
  post_type: string;
  featured: boolean;
  created_at: string;
  author_id: string;
  reading_time?: number;
  view_count?: number;
  status?: string;
}

interface PostCardProps {
  post: Post;
  variant?: "default" | "featured" | "compact";
  likesCount?: number;
  commentsCount?: number;
}

const PostCard = ({ post, variant = "default", likesCount = 0, commentsCount = 0 }: PostCardProps) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getExcerpt = () => {
    if (post.excerpt) return post.excerpt;
    return post.content.slice(0, 120) + (post.content.length > 120 ? "..." : "");
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "news":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "blog":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "announcement":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const renderImage = (aspectClass: string) => {
    if (!post.image_url || imageError) {
      return (
        <div className={cn(aspectClass, "bg-gradient-to-br from-secondary to-muted flex items-center justify-center")}>
          <span className="text-4xl opacity-20">📰</span>
        </div>
      );
    }

    return (
      <div className={cn(aspectClass, "overflow-hidden relative bg-muted")}>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={post.image_url}
          alt={post.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
            "group-hover:scale-105"
          )}
        />
      </div>
    );
  };

  if (variant === "featured") {
    return (
      <Card
        className="group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-card"
        onClick={() => navigate(`/app/post/${post.id}`)}
      >
        {renderImage("aspect-[16/10]")}
        <div className="p-4">
          <Badge variant="outline" className={cn("text-xs font-semibold uppercase tracking-wider mb-2", getTypeColor(post.post_type))}>
            {post.post_type}
          </Badge>
          <h3 className="font-bold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span>{timeAgo}</span>
            {post.reading_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.reading_time} min
              </span>
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className="flex gap-4 cursor-pointer group"
        onClick={() => navigate(`/app/post/${post.id}`)}
      >
        <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
          {renderImage("w-full h-full")}
        </div>
        <div className="flex-1 min-w-0 py-1">
          <Badge variant="outline" className={cn("text-[10px] font-semibold uppercase tracking-wider mb-1", getTypeColor(post.post_type))}>
            {post.post_type}
          </Badge>
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{timeAgo}</span>
            {post.reading_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.reading_time} min
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "group overflow-hidden cursor-pointer transition-all duration-300 border-0 shadow-card",
        "hover:shadow-xl hover:-translate-y-1"
      )}
      onClick={() => navigate(`/app/post/${post.id}`)}
    >
      {renderImage("aspect-[16/9]")}
      <div className="p-5">
        {/* Category & Meta */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className={cn("text-xs font-semibold uppercase tracking-wider", getTypeColor(post.post_type))}>
            {post.post_type}
          </Badge>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
          {post.title}
        </h3>

        {/* Subtitle */}
        {post.subtitle && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1 font-medium">
            {post.subtitle}
          </p>
        )}

        {/* Excerpt */}
        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">
          {getExcerpt()}
        </p>

        {/* Footer Meta */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {post.reading_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.reading_time} min read
              </span>
            )}
            {(post.view_count ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.view_count}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {likesCount > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                {likesCount}
              </span>
            )}
            {commentsCount > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                {commentsCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
