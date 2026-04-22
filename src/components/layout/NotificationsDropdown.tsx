import React from 'react';
import { Bell, Check, Trash2, Trophy, Zap, Wallet, Swords } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

const iconMap: Record<string, React.ReactNode> = {
  reward_received: <Trophy size={14} className="text-primary" />,
  payout_confirmed: <Wallet size={14} className="text-accent" />,
  match_found: <Zap size={14} className="text-primary" />,
  game_completed: <Swords size={14} className="text-foreground" />,
};

const NotificationsDropdown = () => {
  const [unreadCount, setUnreadCount] = React.useState(0);

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const userId = session?.user?.id;

  const { data: notifications, refetch } = useQuery({
    queryKey: ['notifications', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

  React.useEffect(() => {
    if (!notifications) return;
    setUnreadCount(notifications.filter(n => !n.read_at).length);
  }, [notifications]);

  // Real-time subscription
  React.useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notif-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetch]);

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);
    refetch();
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);
    refetch();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse border-2 border-background">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-card border border-border p-0 shadow-2xl">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <span className="font-display text-xs font-bold tracking-widest text-foreground uppercase">NOTIFICATIONS</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-[10px] text-primary hover:text-primary/80" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-64">
          {notifications && notifications.length > 0 ? (
            <div className="divide-y divide-border/50">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 transition-colors ${!n.read_at ? 'bg-primary/5' : 'hover:bg-secondary/30'}`}
                  onClick={() => !n.read_at && markAsRead(n.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-secondary border border-border/50">
                      {iconMap[n.type] ?? <Bell size={14} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold ${!n.read_at ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {n.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-10 opacity-50">
              <Bell size={24} className="mb-2" />
              <p className="text-xs">No notifications yet</p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
