import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Home, Building2, CreditCard, Search } from "lucide-react";

const useCases = [
  {
    icon: Home,
    title: "Indoor Navigation",
    description: "Navigate safely through homes, offices, and indoor spaces with obstacle detection and room identification.",
    examples: ["Furniture detection", "Door identification", "Stair warnings"],
  },
  {
    icon: Building2,
    title: "Public Spaces",
    description: "Confidently move through malls, airports, and public buildings with crowd awareness and direction guidance.",
    examples: ["Crowd density alerts", "Exit detection", "Elevator location"],
  },
  // {
  //   icon: CreditCard,
  //   title: "Financial Transactions",
  //   description: "Handle money independently with accurate currency recognition and denomination identification.",
  //   examples: ["Note identification", "Value confirmation", "Count assistance"],
  // },
  {
    icon: Search,
    title: "Personal Object Awareness",
    description: "Find and identify personal belongings with intelligent object recognition and location feedback.",
    examples: ["Key finding", "Phone location", "Item identification"],
  },
];

export function UseCasesSection() {
  return (
    <section id="use-cases" className="py-24 relative bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <span className="text-sm font-medium text-primary">Use Cases</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Real-World <span className="text-gradient">Applications</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From everyday navigation to specialized tasks, our system adapts to various scenarios to provide meaningful assistance.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {useCases.map((useCase, index) => (
            <Card key={index} variant="glow" className="group">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <useCase.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground mb-2">{useCase.title}</CardTitle>
                    <CardDescription className="text-base">{useCase.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {useCase.examples.map((example, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
