import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, Ban, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  banned: boolean;
  created_at: string;
}

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const toggleBan = async (userId: string, currentlyBanned: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ banned: !currentlyBanned })
      .eq("user_id", userId);

    if (!error) {
      toast({
        title: currentlyBanned ? "User unbanned" : "User banned",
      });
      fetchUsers();
    }
  };

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
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground">Manage your users</p>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {user.name || "Unnamed User"}
                      </h3>
                      {user.banned && (
                        <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                          Banned
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined{" "}
                      {formatDistanceToNow(new Date(user.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  variant={user.banned ? "outline" : "destructive"}
                  size="sm"
                  onClick={() => toggleBan(user.user_id, user.banned)}
                  className="gap-2"
                >
                  {user.banned ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Unban
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4" />
                      Ban
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No users yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
