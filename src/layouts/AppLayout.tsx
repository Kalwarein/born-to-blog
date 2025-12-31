import { Outlet, useLocation } from "react-router-dom";
import BottomNavigation from "@/components/app/BottomNavigation";

const AppLayout = () => {
  const location = useLocation();
  
  // Hide bottom navigation on specific pages
  const hideBottomNav = location.pathname.includes("/app/post/") || 
                        location.pathname === "/app/notifications";

  return (
    <div className={`min-h-screen bg-background ${hideBottomNav ? "" : "pb-20"}`}>
      <Outlet />
      {!hideBottomNav && <BottomNavigation />}
    </div>
  );
};

export default AppLayout;