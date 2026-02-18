import { Eye, Target, Navigation, CheckCircle } from "lucide-react";

export function AboutSection() {
  const features = [
    "Real-time object detection using state-of-the-art AI models",
    "Traffic sign and signal recognition",
    "Distance estimation and spatial awareness",
    "Video upload with annotated screenshot generation",
  ];

  return (
    <section id="about" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
              <span className="text-sm font-medium text-primary">About the Project</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight">
              Empowering Independence Through{" "}
              <span className="text-gradient">AI Vision</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our system uses cutting-edge computer vision and deep learning to detect and identify objects in real time. Using advanced YOLO models, we provide accurate object recognition, traffic sign detection, and distance estimation.
            </p>

            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-card border border-border overflow-hidden relative">
              {/* Central Eye Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-primary/20 animate-pulse-glow" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Eye className="w-16 h-16 text-primary" />
                  </div>
                </div>
              </div>

              {/* Orbiting Elements */}
              <div className="absolute top-8 left-8 w-16 h-16 rounded-xl bg-secondary border border-border flex items-center justify-center animate-float">
                <Target className="w-8 h-8 text-glow-secondary" />
              </div>
              <div className="absolute bottom-8 right-8 w-16 h-16 rounded-xl bg-secondary border border-border flex items-center justify-center animate-float" style={{ animationDelay: "2s" }}>
                <Navigation className="w-8 h-8 text-success" />
              </div>

              {/* Grid Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full" style={{
                  backgroundImage: `
                    linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: "40px 40px"
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
