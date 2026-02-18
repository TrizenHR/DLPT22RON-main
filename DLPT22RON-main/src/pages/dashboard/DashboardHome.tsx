import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Navigation, AlertTriangle, Camera, Globe, Play, Activity } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "Objects Detected Today", value: "127", icon: Target, trend: "+12%" },
  { label: "Obstacles Detected", value: "23", icon: AlertTriangle, trend: "-5%" },
  { label: "Navigation Sessions", value: "8", icon: Navigation, trend: "+3" },
  { label: "Active Time", value: "2h 34m", icon: Activity, trend: "" },
];

const statusItems = [
  { label: "Camera", status: "ON", icon: Camera, active: true },
  { label: "Language", status: "English", icon: Globe, active: true },
];

const DashboardHome = () => {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Welcome Back</h1>
        <p className="text-muted-foreground">Your AI-powered vision assistant is ready to help.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} variant="glass" className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-display font-bold text-foreground">{stat.value}</p>
                {stat.trend && (
                  <p className="text-sm text-success mt-1">{stat.trend}</p>
                )}
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Status and Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* System Status */}
        <Card variant="glow">
          <CardHeader>
            <CardTitle className="text-foreground">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={item.active ? "text-success" : "text-muted-foreground"}>
                    {item.status}
                  </span>
                  {item.active && <div className="w-2 h-2 rounded-full bg-success animate-pulse" />}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card variant="glow">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/dashboard/object-detection">
              <Button variant="hero" size="lg" className="w-full justify-start gap-3">
                <Play className="w-5 h-5" />
                Start Detection
              </Button>
            </Link>
            <Link to="/dashboard/navigation">
              <Button variant="outline" size="lg" className="w-full justify-start gap-3">
                <Navigation className="w-5 h-5" />
                Start Navigation
              </Button>
            </Link>

          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Detections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { object: "Chair", distance: "2.5m", direction: "Front-left", time: "2 min ago" },
              { object: "Person", distance: "3.0m", direction: "Front", time: "5 min ago" },
              { object: "Door", distance: "1.5m", direction: "Right", time: "8 min ago" },
              { object: "Table", distance: "4.0m", direction: "Front-right", time: "12 min ago" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.object}</p>
                    <p className="text-sm text-muted-foreground">{item.direction}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{item.distance}</p>
                  <p className="text-sm text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
