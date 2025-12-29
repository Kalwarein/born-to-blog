import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, Heart, MessageCircle, Eye, TrendingUp, Plus, Edit } from "lucide-react";

interface Stats {
  totalPosts: number;
  totalUsers: number;
  totalLikes: number;
  totalComments: number;
}

interface MyStats {
  myPosts: number;
  myViews: number;
  myLikes: number;
  myComments: number;
}

interface RecentPost {
  id: string;
  title: string;
  view_count: number;
  created_at: string;
  status: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalUsers: 0,
    totalLikes: 0,
    totalComments: 0,
  });
  const [myStats, setMyStats] = useState<MyStats>({
    myPosts: 0,
    myViews: 0,
    myLikes: 0,
    myComments: 0,
  });
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchMyStats();
      fetchRecentPosts();
    }
  }, [user]);

  const fetchStats = async () => {
    const [postsCount, usersCount, likesCount, commentsCount] = await Promise.all([
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("likes").select("*", { count: "exact", head: true }),
      supabase.from("comments").select("*", { count: "exact", head: true }),
    ]);

    setStats({
      totalPosts: postsCount.count || 0,
      totalUsers: usersCount.count || 0,
      totalLikes: likesCount.count || 0,
      totalComments: commentsCount.count || 0,
    });
    setLoading(false);
  };

  const fetchMyStats = async () => {
    if (!user) return;

    // Fetch my posts
    const { data: myPosts, count: myPostsCount } = await supabase
      .from("posts")
      .select("id, view_count", { count: "exact" })
      .eq("author_id", user.id);

    const postIds = myPosts?.map(p => p.id) || [];
    const totalViews = myPosts?.reduce((acc, p) => acc + (p.view_count || 0), 0) || 0;

    // Fetch likes on my posts
    let myLikesCount = 0;
    let myCommentsCount = 0;

    if (postIds.length > 0) {
      const { count: likes } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .in("post_id", postIds);

      const { count: comments } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .in("post_id", postIds);

      myLikesCount = likes || 0;
      myCommentsCount = comments || 0;
    }

    setMyStats({
      myPosts: myPostsCount || 0,
      myViews: totalViews,
      myLikes: myLikesCount,
      myComments: myCommentsCount,
    });
  };

  const fetchRecentPosts = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("posts")
      .select("id, title, view_count, created_at, status")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) setRecentPosts(data);
  };

  const statCards = [
    { title: "Total Posts", value: stats.totalPosts, icon: FileText, color: "bg-primary" },
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-emerald-500" },
    { title: "Total Likes", value: stats.totalLikes, icon: Heart, color: "bg-rose-500" },
    { title: "Total Comments", value: stats.totalComments, icon: MessageCircle, color: "bg-blue-500" },
  ];

  const myStatCards = [
    { title: "My Posts", value: myStats.myPosts, icon: FileText, color: "bg-primary" },
    { title: "My Views", value: myStats.myViews, icon: Eye, color: "bg-violet-500" },
    { title: "My Likes", value: myStats.myLikes, icon: Heart, color: "bg-rose-500" },
    { title: "My Comments", value: myStats.myComments, icon: MessageCircle, color: "bg-blue-500" },
  ];

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your blog</p>
      </div>

      {/* Platform Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Platform Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={stat.title} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* My Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          My Performance
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {myStatCards.map((stat, index) => (
            <Card key={stat.title} className="animate-fade-in border-primary/20" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Recent Posts</CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/posts")}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {recentPosts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No posts yet</p>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{post.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.view_count || 0} views
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        post.status === "published" ? "bg-emerald-100 text-emerald-700" :
                        post.status === "draft" ? "bg-amber-100 text-amber-700" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {post.status}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/admin/posts")}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button onClick={() => navigate("/admin/posts")} className="gap-2">
            <Plus className="w-4 h-4" />
            Create New Post
          </Button>
          <Button variant="secondary" onClick={() => navigate("/admin/publisher")} className="gap-2">
            <Edit className="w-4 h-4" />
            Edit Publisher Profile
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/users")}>
            Manage Users
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
