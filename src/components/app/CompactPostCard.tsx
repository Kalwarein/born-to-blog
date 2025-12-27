import { useNavigate } from "react-router-dom";
import { Clock, Eye } from "lucide-react";
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

interface CompactPostCardProps {
  post: Post;
}

const CompactPostCard = ({ post }: CompactPostCardProps) => {
  const navigate = useNavigate();

  const postTypeColors: Record<string, string> = {
    news: "text-blue-600 bg-blue-50",
    blog: "text-green-600 bg-green-50",
    announcement: "text-purple-600 bg-purple-50",
    post: "text-primary bg-secondary",
  };

  return (
    <button
      onClick={() => navigate(`/app/post/${post.id}`)}
      className="w-full text-left flex gap-4 p-3 bg-card rounded-xl shadow-card hover:shadow-md transition-all duration-200 group"
    >
      {/* Thumbnail */}
      <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
        {post.image_url ? (
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-2xl opacity-50">📰</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div>
          <span className={`inline-block px-2 py-0.5 ${postTypeColors[post.post_type] || postTypeColors.post} text-[10px] font-semibold rounded-md uppercase tracking-wide mb-1`}>
            {post.post_type}
          </span>
          <h3 className="font-semibold text-foreground line-clamp-2 text-sm leading-snug group-hover:text-primary transition-colors">
            {post.title}
          </h3>
        </div>
        
        <div className="flex items-center gap-3 text-muted-foreground text-xs mt-2">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.reading_time} min
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {post.view_count || 0}
          </span>
        </div>
      </div>
    </button>
  );
};

export default CompactPostCard;