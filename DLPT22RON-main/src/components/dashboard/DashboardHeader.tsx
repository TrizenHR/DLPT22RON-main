import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-display font-bold text-foreground">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-glow-secondary flex items-center justify-center text-primary-foreground font-bold">
          U
        </div>
      </div>
    </header>
  );
}
