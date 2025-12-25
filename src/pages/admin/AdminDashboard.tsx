import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Heart, MessageCircle } from "lucide-react";

interface Stats {
  totalPosts: number;
  totalUsers: number;
  totalLikes: number;
  totalComments: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalUsers: 0,
    totalLikes: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

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

  const statCards = [
    {
      title: "Total Posts",
      value: stats.totalPosts,
      icon: FileText,
      color: "bg-primary",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-success",
    },
    {
      title: "Total Likes",
      value: stats.totalLikes,
      icon: Heart,
      color: "bg-destructive",
    },
    {
      title: "Total Comments",
      value: stats.totalComments,
      icon: MessageCircle,
      color: "bg-secondary-foreground",
    },
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card
            key={stat.title}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-primary-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <a
            href="/admin/posts"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Create New Post
          </a>
          <a
            href="/admin/users"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
          >
            Manage Users
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
