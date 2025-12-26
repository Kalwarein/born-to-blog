import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PostCardSkeletonProps {
  variant?: "default" | "featured" | "compact";
}

const PostCardSkeleton = ({ variant = "default" }: PostCardSkeletonProps) => {
  if (variant === "featured") {
    return (
      <Card className="overflow-hidden">
        <Skeleton className="aspect-[16/10] w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex gap-4">
        <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden")}>
      <Skeleton className="aspect-video w-full" />
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-4 pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </Card>
  );
};

export default PostCardSkeleton;
