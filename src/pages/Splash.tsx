import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Newspaper } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStep(1), 300);
    const timer2 = setTimeout(() => setAnimationStep(2), 600);
    const timer3 = setTimeout(() => setAnimationStep(3), 900);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-hero px-6">
      {/* Logo and Brand */}
      <div className={`flex flex-col items-center transition-all duration-700 ${animationStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="w-24 h-24 gradient-primary rounded-3xl flex items-center justify-center shadow-orange mb-6 animate-bounce-soft">
          <Newspaper className="w-12 h-12 text-primary-foreground" />
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

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default Splash;
