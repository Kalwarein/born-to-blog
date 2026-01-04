import { useNavigate } from "react-router-dom";
import { Clock, Eye } from "lucide-react";
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
  is_external?: boolean;
  source_name?: string | null;
  external_url?: string | null;
}

interface Publisher {
  id: string;
  name: string;
  logo_url: string | null;
}

interface CompactPostCardProps {
  post: Post;
}

const CompactPostCard = ({ post }: CompactPostCardProps) => {
  const navigate = useNavigate();
  const [publisher, setPublisher] = useState<Publisher | null>(null);

  useEffect(() => {
    // Don't fetch publisher for external posts
    if (post.author_id && !post.is_external) {
      fetchPublisher();
    }
  }, [post.author_id, post.is_external]);

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
    news: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950",
    blog: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950",
    announcement: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950",
    politics: "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950",
    tech: "text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-950",
    entertainment: "text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-950",
    world: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950",
    opinion: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950",
    sports: "text-lime-600 bg-lime-50 dark:text-lime-400 dark:bg-lime-950",
    business: "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950",
    lifestyle: "text-fuchsia-600 bg-fuchsia-50 dark:text-fuchsia-400 dark:bg-fuchsia-950",
    health: "text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-950",
    post: "text-primary bg-secondary",
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
        
        <div className="flex items-center justify-between text-xs mt-2">
          {/* Publisher/Source Info */}
          {post.is_external && post.source_name ? (
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <span className="text-[8px] text-primary-foreground font-bold">
                  {post.source_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-muted-foreground truncate max-w-[80px] text-xs">
                {post.source_name}
              </span>
            </div>
          ) : publisher && (
            <button
              onClick={handlePublisherClick}
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              {publisher.logo_url ? (
                <img 
                  src={publisher.logo_url} 
                  alt={publisher.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[8px] text-primary-foreground font-bold">
                    {publisher.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-muted-foreground truncate max-w-[80px]">{publisher.name}</span>
            </button>
          )}
          
          <div className="flex items-center gap-3 text-muted-foreground">
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
    </button>
  );
};

export default CompactPostCard;