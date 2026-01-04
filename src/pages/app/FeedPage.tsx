import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FeedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">World News</h1>
        </div>
      </header>

      {/* Embedded Content */}
      <div className="flex-1 w-full">
        <iframe
          src="https://born-2-blog.vercel.app/blog"
          className="w-full h-[calc(100vh-60px)] border-0"
          title="World News"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default FeedPage;
