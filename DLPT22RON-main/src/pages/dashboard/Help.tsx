import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Book, Keyboard, Video, Eye, MessageCircle } from "lucide-react";

const guides = [
  {
    icon: Eye,
    title: "Object Detection Guide",
    description: "Learn how to use the real-time object detection feature effectively.",
  },
  {
    icon: Video,
    title: "Video Analysis",
    description: "Upload and analyze videos for object detection with annotated results.",
  },
  {
    icon: Keyboard,
    title: "Keyboard Shortcuts",
    description: "Quick keyboard shortcuts for faster navigation and control.",
  },
];

const shortcuts = [
  { key: "Space", action: "Start/Stop Detection" },
  { key: "N", action: "Start Navigation" },
  { key: "V", action: "Upload Video" },
  { key: "S", action: "Take Screenshot" },
  { key: "H", action: "Open Help" },
  { key: "Esc", action: "Stop Current Action" },
];

const Help = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Help & Accessibility Guide</h1>
        <p className="text-muted-foreground">Resources and guides to help you get the most out of VisionGuide</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Start Guides */}
        <Card variant="glow" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Book className="w-5 h-5 text-primary" />
              Quick Start Guides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              {guides.map((guide, index) => (
                <Card key={index} variant="feature" className="cursor-pointer">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <guide.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg text-foreground">{guide.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{guide.description}</p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card variant="glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Keyboard className="w-5 h-5 text-primary" />
              Keyboard Shortcuts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-foreground">{shortcut.action}</span>
                  <kbd className="px-3 py-1 rounded-md bg-muted text-muted-foreground font-mono text-sm">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card variant="glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <HelpCircle className="w-5 h-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="font-medium text-foreground mb-2">How accurate is the object detection?</p>
              <p className="text-sm text-muted-foreground">
                Our AI models achieve 94-98% accuracy for common objects in well-lit conditions.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="font-medium text-foreground mb-2">What languages are supported?</p>
              <p className="text-sm text-muted-foreground">
                We support 10+ languages including English, Hindi, Spanish, French, and more.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="font-medium text-foreground mb-2">Does it work offline?</p>
              <p className="text-sm text-muted-foreground">
                Basic detection works offline. Advanced features require an internet connection.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card variant="glow" className="lg:col-span-2">
          <CardContent className="py-8">
            <div className="text-center max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">Need More Help?</h3>
              <p className="text-muted-foreground mb-6">
                Our support team is available 24/7 to assist you with any questions or issues.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero">
                  Contact Support
                </Button>
                <Button variant="outline">
                  View Documentation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;
