import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ProfileMenuItemProps {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  iconBgClass?: string;
  destructive?: boolean;
}

const ProfileMenuItem = ({
  icon: Icon,
  label,
  sublabel,
  onClick,
  rightElement,
  iconBgClass = "bg-secondary",
  destructive = false,
}: ProfileMenuItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl",
        destructive && "text-destructive"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
            destructive ? "bg-destructive/10" : iconBgClass
          )}
        >
          <Icon
            className={cn(
              "w-5 h-5",
              destructive ? "text-destructive" : "text-secondary-foreground"
            )}
          />
        </div>
        <div className="text-left">
          <span className={cn("font-medium block", destructive && "text-destructive")}>
            {label}
          </span>
          {sublabel && (
            <span className="text-sm text-muted-foreground">{sublabel}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {rightElement}
        {!rightElement && (
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
    </button>
  );
};

export default ProfileMenuItem;