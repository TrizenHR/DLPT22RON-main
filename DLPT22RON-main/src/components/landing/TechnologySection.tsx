const technologies = [
  { name: "OpenCV", category: "Vision" },
  { name: "TensorFlow", category: "ML" },
  { name: "PyTorch", category: "ML" },
  { name: "SSD MobileNet V3", category: "Model" },
  { name: "Faster R-CNN", category: "Model" },
  { name: "ResNet-50", category: "Model" },
  { name: "YOLOv11", category: "Model" },
  { name: "Flask", category: "Backend" },
  { name: "Python", category: "Language" },
  { name: "React", category: "Frontend" },
];

export function TechnologySection() {
  return (
    <section id="technology" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <span className="text-sm font-medium text-primary">Technology Stack</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Built with <span className="text-gradient">Cutting-Edge</span> Technology
          </h2>
          <p className="text-lg text-muted-foreground">
            Leveraging the latest in computer vision and machine learning to deliver reliable, fast, and accurate assistance.
          </p>
        </div>

        {/* Tech Badges */}
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className="group px-6 py-3 rounded-full bg-secondary border border-border hover:border-primary/50 hover:bg-secondary/80 transition-all duration-300 cursor-default"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary group-hover:animate-pulse" />
                <span className="font-medium text-foreground">{tech.name}</span>
                <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                  {tech.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Architecture Visual */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-gradient-card border border-border text-center">
              <div className="text-3xl mb-2">📷</div>
              <div className="font-display font-bold text-foreground mb-1">Input</div>
              <div className="text-sm text-muted-foreground">Camera Feed</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-card border border-primary/30 text-center shadow-glow">
              <div className="text-3xl mb-2">🧠</div>
              <div className="font-display font-bold text-foreground mb-1">Process</div>
              <div className="text-sm text-muted-foreground">AI Detection</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-card border border-border text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="font-display font-bold text-foreground mb-1">Output</div>
              <div className="text-sm text-muted-foreground">Detection Results</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
