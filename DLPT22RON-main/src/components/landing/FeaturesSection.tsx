import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, TrafficCone, Video, Ruler, Users, Banknote } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Real-time Object Detection",
    description: "Powered by SSD MobileNet V3 for fast, accurate object recognition in real-time scenarios.",
  },
  {
    icon: TrafficCone,
    title: "Traffic Sign Detection",
    description: "Identify traffic signs, traffic lights, and road signals with high accuracy using YOLO models.",
  },
  {
    icon: Video,
    title: "Video Analysis",
    description: "Upload videos for frame-by-frame detection with annotated screenshots and detection summaries.",
  },
  {
    icon: Ruler,
    title: "Distance Estimation",
    description: "Advanced algorithms estimate object distances and provide obstacle alerts for safe navigation.",
  },
  {
    icon: Users,
    title: "Person Counting",
    description: "Detect and count people in the vicinity to help navigate crowded spaces safely.",
  },
  // {
  //   icon: Banknote,
  //   title: "Currency Recognition",
  //   description: "Identify currency notes accurately to assist with financial transactions independently.",
  // },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <span className="text-sm font-medium text-primary">Key Features</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Powerful Accessibility <span className="text-gradient">Features</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our comprehensive suite of features is designed to provide complete environmental awareness and navigation assistance.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} variant="feature" className="group">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-foreground">{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
