import { useNavigate } from "react-router-dom";
import { Eye, Clock, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  post_type: string;
  reading_time: number;
  view_count: number;
  created_at: string;
  author_id?: string;
  breaking?: boolean;
}

interface Publisher {
  id: string;
  name: string;
  logo_url: string | null;
}

interface FeaturedCardProps {
  post: Post;
}

const FeaturedCard = ({ post }: FeaturedCardProps) => {
  const navigate = useNavigate();
  const [publisher, setPublisher] = useState<Publisher | null>(null);

  useEffect(() => {
    if (post.author_id) {
      fetchPublisher();
    }
  }, [post.author_id]);

  const fetchPublisher = async () => {
    const { data } = await supabase
      .from("publishers")
      .select("id, name, logo_url")
      .eq("admin_id", post.author_id)
      .maybeSingle();
    
    if (data) {
      setPublisher(data);
    }
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

  const handlePublisherClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (publisher) {
      navigate(`/publisher/${publisher.id}`);
    }
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
          <div className="flex items-center justify-between">
            {/* Publisher Info */}
            {publisher && (
              <button
                onClick={handlePublisherClick}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              >
                {publisher.logo_url ? (
                  <img 
                    src={publisher.logo_url} 
                    alt={publisher.name}
                    className="w-5 h-5 rounded-full object-cover border border-white/30"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">
                      {publisher.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-white/90 text-xs truncate max-w-[100px]">{publisher.name}</span>
              </button>
            )}
            
            <div className="flex items-center gap-3 text-white/80 text-xs">
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
        </div>
      </div>
    </button>
  );
};

export default FeaturedCard;