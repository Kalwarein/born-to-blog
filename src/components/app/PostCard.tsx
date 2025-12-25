import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

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

interface PostCardProps {
  post: Post;
  variant?: "default" | "featured" | "compact";
}

const PostCard = ({ post, variant = "default" }: PostCardProps) => {
  const navigate = useNavigate();

  const getExcerpt = () => {
    if (post.excerpt) return post.excerpt;
    return post.content.slice(0, 120) + (post.content.length > 120 ? "..." : "");
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  if (variant === "featured") {
    return (
      <Card
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
        onClick={() => navigate(`/app/post/${post.id}`)}
      >
        {post.image_url && (
          <div className="aspect-[16/10] overflow-hidden">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            {post.post_type}
          </span>
          <h3 className="font-semibold text-foreground mt-1 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{timeAgo}</p>
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
        {post.image_url && (
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{timeAgo}</p>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300",
        "hover:-translate-y-1"
      )}
      onClick={() => navigate(`/app/post/${post.id}`)}
    >
      {post.image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-primary bg-secondary px-2 py-1 rounded-lg uppercase tracking-wider">
            {post.post_type}
          </span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground line-clamp-2">
          {post.title}
        </h3>
        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
          {getExcerpt()}
        </p>
      </div>
    </Card>
  );
};

export default PostCard;
