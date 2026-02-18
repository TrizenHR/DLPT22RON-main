import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation, Play, Pause, Square, AlertTriangle, ArrowUp, ArrowLeft, ArrowRight, Compass } from "lucide-react";
import { useState } from "react";

const obstacles = [
  { type: "Step ahead", distance: "1.2m", severity: "warning" },
  { type: "Low obstacle", distance: "0.8m", severity: "error" },
  { type: "Person approaching", distance: "3.0m", severity: "info" },
];

const instructions = [
  { text: "Continue straight for 5 meters", active: true },
  { text: "Slight left turn ahead", active: false },
  { text: "Doorway in 8 meters", active: false },
];

const NavigationAssistance = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Navigation Assistance</h1>
          <p className="text-muted-foreground">Real-time navigation with obstacle detection</p>
        </div>
        <div className="flex items-center gap-2">
          {!isNavigating ? (
            <Button variant="hero" onClick={() => setIsNavigating(true)}>
              <Play className="w-5 h-5 mr-2" />
              Start Navigation
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setIsNavigating(false);
                  setIsPaused(false);
                }}
              >
                <Square className="w-5 h-5 mr-2" />
                Stop
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Direction Display */}
        <Card variant="glow" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Navigation className="w-5 h-5 text-primary" />
              Direction Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[16/10] rounded-xl bg-secondary/30 border border-border flex items-center justify-center relative">
              {/* Direction Arrows */}
              <div className="relative w-64 h-64">
                {/* Center Point */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                </div>

                {/* Forward Arrow - Active */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2">
                  <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center animate-pulse">
                    <ArrowUp className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-center text-sm text-primary mt-2 font-medium">Continue</p>
                </div>

                {/* Left Arrow */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                  <div className="w-14 h-14 rounded-full bg-secondary border border-border flex items-center justify-center">
                    <ArrowLeft className="w-6 h-6 text-muted-foreground" />
                  </div>
                </div>

                {/* Right Arrow */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <div className="w-14 h-14 rounded-full bg-secondary border border-border flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Status */}
              {isNavigating && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-card/80 backdrop-blur-lg rounded-lg p-4 border border-border">
                    <p className="text-lg font-medium text-foreground text-center">
                      {isPaused ? "Navigation Paused" : "Continue straight for 5 meters"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Navigation Instructions */}
          <Card variant="glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Compass className="w-5 h-5 text-primary" />
                Navigation Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {instructions.map((instruction, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-colors ${
                      instruction.active
                        ? "bg-primary/10 border-primary/30 text-foreground"
                        : "bg-secondary/30 border-border text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm">{instruction.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Obstacle Alerts */}
          <Card variant="glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Obstacle Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {obstacles.map((obstacle, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      obstacle.severity === "error"
                        ? "bg-destructive/10 border-destructive/30"
                        : obstacle.severity === "warning"
                        ? "bg-warning/10 border-warning/30"
                        : "bg-secondary/30 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{obstacle.type}</span>
                      <span className="text-sm text-muted-foreground">{obstacle.distance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NavigationAssistance;
