import { useLocation, useNavigate } from "react-router-dom";
import { Home, Newspaper, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";

const navItems = [
  { to: "/app", icon: Home, label: "Home", exact: true },
  { to: "/app/feed", icon: Newspaper, label: "Feed" },
  { to: "/app/saved", icon: Bookmark, label: "Saved" },
  { to: "/app/profile", icon: User, label: "Profile" },
];

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const getActiveIndex = () => {
    return navItems.findIndex((item) => {
      if (item.exact) {
        return location.pathname === item.to;
      }
      return location.pathname.startsWith(item.to) && location.pathname !== "/app";
    });
  };

  const activeIndex = getActiveIndex();

  useEffect(() => {
    const activeButton = itemRefs.current[activeIndex];
    if (activeButton && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - navRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeIndex, location.pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div 
        ref={navRef}
        className="relative flex items-center justify-around h-16 max-w-lg mx-auto px-2"
      >
        {/* Animated indicator */}
        <div
          className="absolute top-1 h-[calc(100%-8px)] bg-primary rounded-xl shadow-orange transition-all duration-500 ease-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            transform: 'translateZ(0)',
          }}
        />

        {navItems.map((item, index) => {
          const isActive = activeIndex === index;

          return (
            <button
              key={item.to}
              ref={(el) => (itemRefs.current[index] = el)}
              onClick={() => navigate(item.to)}
              className={cn(
                "relative z-10 flex flex-col items-center justify-center w-16 h-[calc(100%-8px)] rounded-xl transition-all duration-300",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon 
                className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  isActive && "scale-110"
                )} 
              />
              <span 
                className={cn(
                  "text-[10px] font-medium mt-0.5 transition-all duration-300",
                  isActive ? "opacity-100" : "opacity-70"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;