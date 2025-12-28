import { useNavigate } from "react-router-dom";
import { Eye, Clock, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  post_type: string;
  reading_time: number;
  view_count: number;
  created_at: string;
  breaking?: boolean;
}

interface FeaturedCardProps {
  post: Post;
}

const FeaturedCard = ({ post }: FeaturedCardProps) => {
  const navigate = useNavigate();

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
    post: "bg-primary",
  };

  return (
    <button
      onClick={() => navigate(`/app/post/${post.id}`)}
      className="w-full text-left group"
    >
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-3 shadow-card">
        {post.image_url ? (
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-4xl opacity-50">📰</span>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Breaking badge */}
        {post.breaking && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-destructive text-destructive-foreground rounded-full text-xs font-bold uppercase animate-pulse">
            <Zap className="w-3 h-3" />
            Breaking
          </div>
        )}
        
        {/* Category badge */}
        <span className={`absolute top-3 left-3 px-3 py-1 ${postTypeColors[post.post_type] || postTypeColors.post} text-white text-xs font-semibold rounded-full uppercase tracking-wide`}>
          {post.post_type}
        </span>
        
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 mb-2">
            {post.title}
          </h3>
          <div className="flex items-center gap-3 text-white/80 text-xs">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.reading_time} min
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {post.view_count || 0}
            </span>
            <span>
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default FeaturedCard;
