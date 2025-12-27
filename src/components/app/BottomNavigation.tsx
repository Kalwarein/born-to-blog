import { NavLink, useLocation } from "react-router-dom";
import { Home, Newspaper, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/app", icon: Home, label: "Home", exact: true },
  { to: "/app/feed", icon: Newspaper, label: "Feed" },
  { to: "/app/saved", icon: Bookmark, label: "Saved" },
  { to: "/app/profile", icon: User, label: "Profile" },
];

const BottomNavigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border shadow-lg z-50 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to) && location.pathname !== "/app";

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300",
                isActive
                  ? "bg-primary text-primary-foreground shadow-orange scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "animate-scale-in")} />
              <span className="text-xs font-medium mt-1">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;