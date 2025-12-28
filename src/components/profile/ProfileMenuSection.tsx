import { Card, CardContent } from "@/components/ui/card";

interface ProfileMenuSectionProps {
  title?: string;
  children: React.ReactNode;
}

const ProfileMenuSection = ({ title, children }: ProfileMenuSectionProps) => {
  return (
    <div className="space-y-2">
      {title && (
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          {title}
        </h3>
      )}
      <Card className="overflow-hidden shadow-card border-0">
        <CardContent className="p-0 divide-y divide-border">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileMenuSection;