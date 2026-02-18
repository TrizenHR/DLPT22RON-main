import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Banknote, Camera, Upload, Volume2, CheckCircle } from "lucide-react";
import { useState } from "react";

const recognitionHistory = [
  { value: "₹500", time: "Just now", confidence: 98 },
  { value: "₹100", time: "2 min ago", confidence: 96 },
  { value: "₹2000", time: "5 min ago", confidence: 99 },
  { value: "₹50", time: "8 min ago", confidence: 94 },
];

const CurrencyRecognition = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);

  const handleScan = () => {
    setIsScanning(true);
    setDetectedCurrency(null);
    setTimeout(() => {
      setIsScanning(false);
      setDetectedCurrency("₹500");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Currency Recognition</h1>
        <p className="text-muted-foreground">Identify currency notes for independent financial transactions</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Scan Area */}
        <Card variant="glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Camera className="w-5 h-5 text-primary" />
              Scan Currency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-xl bg-secondary/50 border border-border flex items-center justify-center relative overflow-hidden mb-4">
              {isScanning ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-24 border-2 border-primary rounded-lg animate-pulse" />
                  <div className="absolute inset-0 bg-primary/5">
                    <div className="h-1 bg-primary/50 animate-[scan_1s_ease-in-out_infinite]" style={{
                      animation: "scan 1.5s ease-in-out infinite"
                    }} />
                  </div>
                </div>
              ) : detectedCurrency ? (
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-success" />
                  </div>
                  <p className="text-4xl font-display font-bold text-foreground mb-2">{detectedCurrency}</p>
                  <p className="text-muted-foreground">Currency detected successfully</p>
                </div>
              ) : (
                <div className="text-center">
                  <Banknote className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Position currency note in camera view</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="hero" onClick={handleScan} disabled={isScanning}>
                <Camera className="w-5 h-5 mr-2" />
                {isScanning ? "Scanning..." : "Scan Note"}
              </Button>
              <Button variant="outline">
                <Upload className="w-5 h-5 mr-2" />
                Upload Image
              </Button>
            </div>

            {detectedCurrency && (
              <Button variant="secondary" className="w-full mt-4">
                <Volume2 className="w-5 h-5 mr-2" />
                Announce: "Detected {detectedCurrency} note"
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recognition History */}
        <Card variant="glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Banknote className="w-5 h-5 text-primary" />
              Recognition History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recognitionHistory.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Banknote className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-display font-bold text-foreground">{item.value}</p>
                      <p className="text-sm text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-success font-medium">{item.confidence}%</p>
                    <p className="text-xs text-muted-foreground">confidence</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Total Scanned Today</span>
                <span className="font-display font-bold text-foreground">₹2,650</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Notes Scanned</span>
                <span className="font-display font-bold text-foreground">4</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CurrencyRecognition;
