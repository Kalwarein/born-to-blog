import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import logo from "@/assets/logo.jpg";

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">About</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Logo & App Info */}
        <div className="text-center py-8">
          <div className="w-24 h-24 mx-auto rounded-3xl overflow-hidden shadow-card mb-4">
            <img src={logo} alt="Born to Blog" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold">Born to Blog</h2>
          <p className="text-muted-foreground mt-1">Version 1.0.0</p>
        </div>

        {/* Description */}
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <p className="text-foreground leading-relaxed">
              Born to Blog is your premium destination for curated news, insightful articles, 
              and engaging content. Stay informed with breaking news, explore diverse topics, 
              and enjoy a seamless reading experience.
            </p>
          </CardContent>
        </Card>

        {/* Links */}
        <Card className="shadow-card border-0">
          <CardContent className="p-0 divide-y divide-border">
            <a 
              href="https://borntoblog.netlify.app/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
            >
              <span className="font-medium">Terms of Service</span>
              <ExternalLink className="w-4 h-4 text-primary" />
            </a>
            <a 
              href="https://borntoblog.netlify.app/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
            >
              <span className="font-medium">Privacy Policy</span>
              <ExternalLink className="w-4 h-4 text-primary" />
            </a>
            <button className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
              <span className="font-medium">Open Source Licenses</span>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Made with ❤️ for readers everywhere
        </p>
      </main>
    </div>
  );
};

export default AboutPage;