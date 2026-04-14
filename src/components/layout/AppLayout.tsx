import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Zap, LayoutDashboard, Trophy, Swords, History, Award, LogOut } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/play', label: 'Play', icon: Swords },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/history', label: 'History', icon: History },
  { path: '/tournaments', label: 'Tournaments', icon: Award },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <Zap className="text-primary" size={20} />
          <span className="font-display text-lg font-bold tracking-wider text-foreground">
            CHESS<span className="text-primary">X</span>
          </span>
        </div>
        <button
          onClick={() => navigate('/auth')}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-20 max-w-2xl mx-auto w-full">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-1 z-50">
        <div className="flex items-center justify-around max-w-2xl mx-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path || (item.path === '/play' && location.pathname === '/');
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg transition-colors ${
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-display tracking-wider">{item.label.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
