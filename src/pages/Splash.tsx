import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Newspaper } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    // If user is already authenticated, skip splash and go to app
    if (!loading && user) {
      navigate("/app", { replace: true });
      return;
    }

    // Start animations only if showing splash
    if (!loading && !user) {
      const timer1 = setTimeout(() => setAnimationStep(1), 300);
      const timer2 = setTimeout(() => setAnimationStep(2), 600);
      const timer3 = setTimeout(() => setAnimationStep(3), 900);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [loading, user, navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is logged in, don't render splash (navigation will happen)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-hero px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Logo and Brand */}
      <div className={`flex flex-col items-center transition-all duration-700 ${animationStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="w-28 h-28 gradient-primary rounded-3xl flex items-center justify-center shadow-orange mb-8 animate-bounce-soft">
          <Newspaper className="w-14 h-14 text-primary-foreground" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 text-center">
          Born to <span className="text-gradient">Blog</span>
        </h1>
        
        <p className={`text-muted-foreground text-lg text-center mt-4 max-w-xs transition-all duration-700 delay-200 ${animationStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Discover stories, ideas, and expertise from writers on any topic.
        </p>
      </div>

      {/* CTA Button */}
      <div className={`mt-16 w-full max-w-xs transition-all duration-700 delay-500 ${animationStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Button
          variant="hero"
          size="xl"
          className="w-full"
          onClick={() => navigate("/auth")}
        >
          Get Started
        </Button>
        
        <p className="text-muted-foreground text-sm text-center mt-4">
          Join thousands of readers today
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default Splash;
