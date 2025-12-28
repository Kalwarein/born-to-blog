import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Trash2 } from "lucide-react";
import CompactPostCard from "@/components/app/CompactPostCard";
import { useToast } from "@/hooks/use-toast";

interface ReadingHistoryItem {
  id: string;
  post_id: string;
  read_at: string;
  posts: {
    id: string;
    title: string;
    excerpt: string | null;
    image_url: string | null;
    post_type: string;
    reading_time: number;
    view_count: number;
    created_at: string;
  };
}

const ReadingHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("reading_history")
      .select(`*, posts (*)`)
      .eq("user_id", user.id)
      .order("read_at", { ascending: false })
      .limit(50);

    if (data) {
      setHistory(data.filter((item: any) => item.posts) as ReadingHistoryItem[]);
    }
    setLoading(false);
  };

  const clearHistory = async () => {
    if (!user) return;

    await supabase.from("reading_history").delete().eq("user_id", user.id);
    setHistory([]);
    toast({ title: "History cleared" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Reading History</h1>
          </div>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearHistory} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </header>

      <main className="px-4 py-4">
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item) => (
              <CompactPostCard key={item.id} post={item.posts} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No reading history</h2>
            <p className="text-muted-foreground">Articles you read will appear here</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReadingHistoryPage;