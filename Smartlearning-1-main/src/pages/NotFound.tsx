import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import spaceBackground from '@/assets/space-background.jpg';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div 
      className="min-h-screen bg-gradient-space relative flex items-center justify-center"
      style={{
        backgroundImage: `url(${spaceBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-space-deep/80 backdrop-blur-[1px]" />
      
      <div className="relative z-10 text-center max-w-md mx-auto p-6">
        <GlassCard variant="primary" glow className="animate-scale-in">
          <GlassCardContent className="p-8 text-center">
            <div className="text-6xl font-bold bg-gradient-neon bg-clip-text text-transparent mb-4">
              404
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Page Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The holographic pathway you're looking for doesn't exist in our learning dimension.
            </p>
            <Button 
              variant="neon" 
              size="lg"
              onClick={() => navigate('/', { replace: true })}
              className=""
            >
              Return to Launch Pad
            </Button>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
};

export default NotFound;