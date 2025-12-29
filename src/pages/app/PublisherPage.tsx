import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Eye, Heart, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import CompactPostCard from "@/components/app/CompactPostCard";
import { format } from "date-fns";

interface Publisher {
  id: string;
  admin_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  total_views: number;
  total_likes: number;
  created_at: string;
}

interface Post {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  post_type: string;
  created_at: string;
  reading_time: number;
  view_count: number;
}

const PublisherPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    if (id) {
      fetchPublisher();
      fetchPosts();
    }
  }, [id]);

  const fetchPublisher = async () => {
    const { data, error } = await supabase
      .from("publishers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching publisher:", error);
      navigate("/");
      return;
    }

    setPublisher(data);
    setLoading(false);
  };

  const fetchPosts = async () => {
    // First get the publisher to get admin_id
    const { data: pub } = await supabase
      .from("publishers")
      .select("admin_id")
      .eq("id", id)
      .single();

    if (!pub) return;

    const { data, error, count } = await supabase
      .from("posts")
      .select("id, title, subtitle, image_url, post_type, created_at, reading_time, view_count", { count: "exact" })
      .eq("author_id", pub.admin_id)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPosts(data);
      setPostCount(count || 0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-48 bg-muted" />
        <div className="max-w-4xl mx-auto px-4 -mt-16">
          <Skeleton className="w-32 h-32 rounded-full" />
          <Skeleton className="h-8 w-48 mt-4" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
      </div>
    );
  }

  if (!publisher) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Publisher not found</p>
      </div>
    );
  }

  const initials = publisher.name
    ? publisher.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "PB";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Banner */}
      <div 
        className="h-48 md:h-64 bg-gradient-to-r from-primary/20 to-primary/10 relative"
        style={publisher.banner_url ? { backgroundImage: `url(${publisher.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-full"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Profile Section */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-20">
          <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
            <AvatarImage src={publisher.logo_url || undefined} alt={publisher.name} />
            <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 pb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {publisher.name || "Publisher"}
            </h1>
            <p className="text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="w-4 h-4" />
              Joined {format(new Date(publisher.created_at), "MMMM yyyy")}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-card rounded-2xl p-4 text-center shadow-sm border border-border">
            <div className="flex items-center justify-center gap-2 text-primary mb-1">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{postCount}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center shadow-sm border border-border">
            <div className="flex items-center justify-center gap-2 text-primary mb-1">
              <Eye className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{publisher.total_views}</p>
            <p className="text-xs text-muted-foreground">Views</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center shadow-sm border border-border">
            <div className="flex items-center justify-center gap-2 text-primary mb-1">
              <Heart className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{publisher.total_likes}</p>
            <p className="text-xs text-muted-foreground">Likes</p>
          </div>
        </div>

        {/* Description */}
        {publisher.description && (
          <div className="mt-6 p-4 bg-card rounded-2xl border border-border">
            <h2 className="font-semibold text-foreground mb-2">About</h2>
            <p className="text-muted-foreground leading-relaxed">{publisher.description}</p>
          </div>
        )}

        {/* Posts */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Articles ({postCount})
          </h2>
          
          {posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No articles published yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <CompactPostCard
                  key={post.id}
                  post={{
                    id: post.id,
                    title: post.title,
                    excerpt: post.subtitle,
                    image_url: post.image_url,
                    post_type: post.post_type,
                    reading_time: post.reading_time,
                    view_count: post.view_count,
                    created_at: post.created_at,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublisherPage;
