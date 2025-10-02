import React, { useState, useEffect } from 'react';
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, RotateCcw, Download, Volume2, VolumeX, Zap, Atom, Calculator, Microscope, Globe2, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";
import { GradeLevel } from '@/pages/AITutorHub';

interface SubjectSimulationProps {
  subject: string;
  gradeLevel: GradeLevel;
  className?: string;
}

interface SimulationStep {
  id: string;
  title: string;
  description: string;
  narration: string;
  visual: string;
  duration: number;
}

const simulations = {
  chemistry: {
    primary: [
      {
        id: '1',
        title: 'Mixing Colors',
        description: 'Watch what happens when we mix red and blue paint!',
        narration: 'When we put red paint and blue paint together, they make purple! This is like a magic trick with colors.',
        visual: 'Two paint drops merging to create purple',
        duration: 3000
      }
    ],
    middle: [
      {
        id: '1',
        title: 'Acid + Base Reaction',
        description: 'See how hydrochloric acid reacts with sodium hydroxide',
        narration: 'When acid meets base, they neutralize each other and form salt and water. The pH changes from acidic to neutral.',
        visual: 'Test tubes showing color change from red to green',
        duration: 5000
      }
    ],
    high: [
      {
        id: '1',
        title: 'NaCl + H₂SO₄ Reaction',
        description: 'Sodium chloride reacts with sulfuric acid to produce hydrogen chloride gas',
        narration: 'In this displacement reaction, sulfuric acid displaces hydrochloric acid from sodium chloride. Notice the gas evolution and heat generation.',
        visual: 'Laboratory setup with gas collection apparatus',
        duration: 8000
      }
    ]
  },
  math: {
    primary: [
      {
        id: '1',
        title: 'Counting Apples',
        description: 'Let\'s count apples and learn addition!',
        narration: 'If we have 3 apples and add 2 more apples, we get 5 apples total! 3 + 2 = 5.',
        visual: 'Animated apples appearing one by one',
        duration: 4000
      }
    ],
    middle: [
      {
        id: '1',
        title: 'Geometry - Triangle Properties',
        description: 'Exploring angles and sides of triangles',
        narration: 'Every triangle has three angles that add up to 180 degrees. Let\'s see how changing one angle affects the others.',
        visual: 'Interactive triangle with moveable vertices',
        duration: 6000
      }
    ],
    high: [
      {
        id: '1',
        title: 'Calculus - Derivative Visualization',
        description: 'Understanding rates of change through visual representation',
        narration: 'The derivative represents the slope of a function at any point. Watch how the tangent line changes as we move along the curve.',
        visual: 'Animated graph showing tangent lines moving along curves',
        duration: 10000
      }
    ]
  },
  biology: {
    primary: [
      {
        id: '1',
        title: 'How Plants Grow',
        description: 'Watch a seed grow into a plant!',
        narration: 'A tiny seed needs water, sunlight, and soil to grow. First comes the root, then the stem, and finally the leaves!',
        visual: 'Time-lapse plant growth animation',
        duration: 5000
      }
    ],
    middle: [
      {
        id: '1',
        title: 'Cell Division - Mitosis',
        description: 'See how one cell becomes two identical cells',
        narration: 'During mitosis, the cell duplicates its DNA and then divides to create two identical daughter cells.',
        visual: '3D animation of cell division process',
        duration: 8000
      }
    ],
    high: [
      {
        id: '1',
        title: 'Protein Synthesis',
        description: 'From DNA to protein - the central dogma of biology',
        narration: 'DNA is transcribed to mRNA, which is then translated by ribosomes to produce specific proteins essential for life.',
        visual: '3D molecular animation of transcription and translation',
        duration: 12000
      }
    ]
  },
  physics: {
    primary: [
      {
        id: '1',
        title: 'Bouncing Ball',
        description: 'Why do balls bounce back up?',
        narration: 'When we drop a ball, gravity pulls it down. When it hits the ground, it bounces back up! Energy makes it move.',
        visual: 'Animated bouncing ball with energy indicators',
        duration: 4000
      }
    ],
    middle: [
      {
        id: '1',
        title: 'Simple Pendulum',
        description: 'Understanding periodic motion and energy transfer',
        narration: 'A pendulum swings back and forth, converting potential energy to kinetic energy and back again.',
        visual: 'Pendulum with energy bar indicators',
        duration: 6000
      }
    ],
    high: [
      {
        id: '1',
        title: 'Electromagnetic Induction',
        description: 'How moving magnets generate electricity',
        narration: 'When a magnetic field changes through a coil of wire, it induces an electric current. This is how generators and transformers work.',
        visual: 'Animated magnetic field lines and current flow',
        duration: 10000
      }
    ]
  },
  geography: {
    primary: [
      {
        id: '1',
        title: 'Earth\'s Layers',
        description: 'What\'s inside our planet?',
        narration: 'Earth has layers like an onion! The crust is where we live, then comes the hot mantle, and finally the super hot core.',
        visual: 'Cross-section of Earth with colorful layers',
        duration: 5000
      }
    ],
    middle: [
      {
        id: '1',
        title: 'Volcano Formation',
        description: 'How volcanoes form and erupt',
        narration: 'Volcanoes form when hot magma from deep inside Earth pushes up through cracks in the crust.',
        visual: 'Cross-section animation of volcano eruption',
        duration: 8000
      }
    ],
    high: [
      {
        id: '1',
        title: 'Plate Tectonics',
        description: 'Understanding continental drift and geological processes',
        narration: 'Earth\'s crust consists of moving plates that collide, separate, and slide past each other, creating mountains, earthquakes, and ocean basins.',
        visual: 'Global animation of plate movements over time',
        duration: 12000
      }
    ]
  },
  history: {
    primary: [
      {
        id: '1',
        title: 'Ancient Egypt',
        description: 'Life along the Nile River',
        narration: 'Long ago in Egypt, people built amazing pyramids and wrote with pictures called hieroglyphs!',
        visual: 'Animated Egyptian scenes with pyramids and hieroglyphs',
        duration: 6000
      }
    ],
    middle: [
      {
        id: '1',
        title: 'Medieval Castle Life',
        description: 'Daily life in a medieval fortress',
        narration: 'Medieval castles were home to knights, lords, and servants. They provided protection and were centers of feudal society.',
        visual: 'Cross-section of castle with animated medieval life',
        duration: 8000
      }
    ],
    high: [
      {
        id: '1',
        title: 'Industrial Revolution',
        description: 'Transformation of society through mechanization',
        narration: 'The Industrial Revolution marked the shift from agriculture to manufacturing, transforming society, economy, and technology forever.',
        visual: 'Timeline animation showing technological progression',
        duration: 10000
      }
    ]
  }
};

const subjectIcons = {
  chemistry: Atom,
  math: Calculator,
  biology: Microscope,
  physics: Zap,
  geography: Globe2,
  history: Clock
};

export function SubjectSimulation({ subject, gradeLevel, className }: SubjectSimulationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState(0);

  const currentSimulations = simulations[subject as keyof typeof simulations]?.[gradeLevel] || [];
  const simulation = currentSimulations[selectedSimulation];
  const Icon = subjectIcons[subject as keyof typeof subjectIcons] || Atom;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && simulation) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + (100 / (simulation.duration / 100));
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, simulation]);

  const handlePlay = () => {
    if (progress >= 100) {
      setProgress(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  if (!simulation) {
    return (
      <GlassCard className={cn("p-6", className)}>
        <div className="text-center text-space-400">
          <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No simulations available for {subject} at {gradeLevel} level.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
      {/* Simulation Viewer */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neon-blue">{simulation.title}</h2>
              <Badge variant="secondary">{gradeLevel.toUpperCase()}</Badge>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Visual Simulation Area */}
        <div className="bg-space-800 rounded-lg p-8 mb-6 min-h-[300px] flex items-center justify-center border border-space-600">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">
              {subject === 'chemistry' && '🧪'}
              {subject === 'math' && '📐'}
              {subject === 'biology' && '🔬'}
              {subject === 'physics' && '⚡'}
              {subject === 'geography' && '🌍'}
              {subject === 'history' && '🏛️'}
            </div>
            <p className="text-space-300 italic">{simulation.visual}</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-space-700 rounded-full h-2 mt-6">
              <div 
                className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          {isPlaying ? (
            <Button onClick={handlePause} className="bg-gradient-to-r from-neon-blue to-neon-purple">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button onClick={handlePlay} className="bg-gradient-to-r from-neon-blue to-neon-purple">
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
          )}
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </GlassCard>

      {/* Notes & Narration Panel */}
      <div className="space-y-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-neon-cyan mb-4">Description</h3>
          <p className="text-space-200 leading-relaxed">{simulation.description}</p>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-neon-purple mb-4">Narration Transcript</h3>
          <ScrollArea className="h-32">
            <p className="text-space-200 leading-relaxed text-sm">{simulation.narration}</p>
          </ScrollArea>
          
          {!isMuted && isPlaying && (
            <div className="mt-4 p-2 bg-neon-blue/10 rounded border border-neon-blue/30">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-neon-blue animate-pulse" />
                <span className="text-sm text-neon-blue">Playing narration...</span>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Simulation Selector */}
        {currentSimulations.length > 1 && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-neon-cyan mb-4">More Simulations</h3>
            <div className="space-y-2">
              {currentSimulations.map((sim, index) => (
                <Button
                  key={sim.id}
                  variant={selectedSimulation === index ? "default" : "outline"}
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    setSelectedSimulation(index);
                    handleReset();
                  }}
                >
                  {sim.title}
                </Button>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}