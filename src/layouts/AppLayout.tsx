import { Outlet } from "react-router-dom";
import BottomNavigation from "@/components/app/BottomNavigation";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Outlet />
      <BottomNavigation />
    </div>
  );
};

export default AppLayout;
