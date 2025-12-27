"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { LayoutGrid, List, ArrowLeftRight, Folder, User } from "lucide-react";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  // We use state to track which index is active to move the "dip"
  const [activeTab, setActiveTab] = React.useState("transfer");

  return (
    <div className="relative flex justify-center w-full bg-[#FF002E] p-8 min-h-[200px] items-end">
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          "relative flex h-20 w-full max-w-md items-center justify-around bg-white px-4 rounded-t-[32px]",
          className
        )}
        {...props}
      >
        {/* The Animated Cutout / Dip */}
        <motion.div
          className="absolute top-0 h-full flex justify-center pointer-events-none"
          initial={false}
          animate={{
            // Calculations for positioning the dip:
            // We divide the bar into 5 equal sections (20% each)
            x: activeTab === "grid" ? "-40%" : 
               activeTab === "list" ? "-20%" : 
               activeTab === "transfer" ? "0%" : 
               activeTab === "folder" ? "20%" : "40%"
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ width: "20%" }}
        >
          {/* This SVG creates the "U" shape dip */}
          <svg
            width="100"
            height="40"
            viewBox="0 0 100 40"
            className="absolute -top-[1px]"
            fill="none"
          >
            <path
              d="M0 0 H20 C30 0 35 35 50 35 C65 35 70 0 80 0 H100 V40 H0 Z"
              fill="#FF002E" // Matches background
            />
          </svg>
          
          {/* The Floating White Circle */}
          <div className="absolute -top-6 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="text-black">
               {/* This reflects the icon of the active tab */}
               {activeTab === "transfer" && <ArrowLeftRight size={24} />}
               {activeTab === "grid" && <LayoutGrid size={24} />}
               {activeTab === "list" && <List size={24} />}
               {activeTab === "folder" && <Folder size={24} />}
               {activeTab === "user" && <User size={24} />}
            </div>
          </div>
        </motion.div>

        {children}
      </TabsPrimitive.List>
    </div>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & { isActive?: boolean }
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "z-10 flex flex-col items-center justify-center transition-all duration-300 text-gray-400 data-[state=active]:opacity-0",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// Example Usage Component
export function AnimatedNavbar() {
  return (
    <Tabs defaultValue="transfer" className="w-full">
      <TabsList>
        <TabsTrigger value="grid"><LayoutGrid size={24} /></TabsTrigger>
        <TabsTrigger value="list"><List size={24} /></TabsTrigger>
        <TabsTrigger value="transfer"><ArrowLeftRight size={24} /></TabsTrigger>
        <TabsTrigger value="folder"><Folder size={24} /></TabsTrigger>
        <TabsTrigger value="user"><User size={24} /></TabsTrigger>
      </TabsList>
    </Tabs>
  );
               }
      
