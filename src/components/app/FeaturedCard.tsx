import { useNavigate } from "react-router-dom";
import { Eye, Clock } from "lucide-react";
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