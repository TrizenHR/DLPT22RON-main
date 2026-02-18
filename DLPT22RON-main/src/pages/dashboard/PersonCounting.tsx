import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Camera, UserPlus, UserMinus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5000/api";
const DETECTION_INTERVAL = 1500;

interface PersonDetection {
  label: string;
  confidence: number;
  position: string;
  distance: string;
  box: number[];
}

interface PersonDetectionResult {
  persons: PersonDetection[];
  person_count: number;
  frame_height: number;
  frame_width: number;
}

const PersonCounting = () => {
  const [isActive, setIsActive] = useState(false);
  const [detectionResult, setDetectionResult] = useState<PersonDetectionResult | null>(null);
  const [statusMessage, setStatusMessage] = useState("Idle");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);

  const clearDetectionLoop = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isProcessingRef.current = false;
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      return null;
    }

    const width = video.videoWidth || video.clientWidth;
    const height = video.videoHeight || video.clientHeight;
    if (!width || !height) {
      return null;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.7);
  };

  const runDetection = async () => {
    if (isProcessingRef.current) {
      return;
    }

    const frame = captureFrame();
    if (!frame) {
      return;
    }

    isProcessingRef.current = true;
    setStatusMessage("Analyzing people…");

    try {
      const response = await fetch(`${API_BASE_URL}/detect_persons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ frame }),
      });

      if (!response.ok) {
        throw new Error("Detection failed");
      }

      const result: PersonDetectionResult = await response.json();
      setDetectionResult(result);
      setLastUpdated(new Date());
      setStatusMessage(
        result.person_count ? `${result.person_count} person${result.person_count > 1 ? "s" : ""} detected` : "No people detected"
      );
    } catch (error) {
      console.error("Person detection error:", error);
      setStatusMessage("Detection failed");
    } finally {
      isProcessingRef.current = false;
    }
  };

  const startDetectionLoop = () => {
    if (intervalRef.current) {
      return;
    }

    runDetection();
    intervalRef.current = window.setInterval(runDetection, DETECTION_INTERVAL);
  };

  const stopDetectionLoop = () => {
    clearDetectionLoop();
  };

  const startCameraAndDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsActive(true);
          setStatusMessage("Camera ready. Starting detection...");
          startDetectionLoop();
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setStatusMessage("Camera access denied");
    }
  };

  const stopCamera = () => {
    stopDetectionLoop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setDetectionResult(null);
    setStatusMessage("Camera stopped");
    setLastUpdated(null);
  };

  const handleToggleCounting = () => {
    if (isActive) {
      stopCamera();
    } else {
      startCameraAndDetection();
    }
  };



  useEffect(() => {
    return () => {
      stopCamera();
      clearDetectionLoop();
    };
  }, []);

  const getOverlayStyles = (box: number[]) => {
    if (!detectionResult || !videoRef.current) {
      return {};
    }

    const [left, top, right, bottom] = box;
    const videoWidth = videoRef.current.clientWidth || 1;
    const videoHeight = videoRef.current.clientHeight || 1;
    const frameWidth = detectionResult.frame_width || 1;
    const frameHeight = detectionResult.frame_height || 1;

    const scaleX = videoWidth / frameWidth;
    const scaleY = videoHeight / frameHeight;

    return {
      left: `${left * scaleX}px`,
      top: `${top * scaleY}px`,
      width: `${(right - left) * scaleX}px`,
      height: `${(bottom - top) * scaleY}px`,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Person Counting</h1>
          <p className="text-muted-foreground">Detect and count people in your surroundings</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant={isActive ? "destructive" : "hero"}
            onClick={handleToggleCounting}
          >
            {isActive ? "Stop Counting" : "Start Counting"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Camera Preview */}
        <Card variant="glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Camera className="w-5 h-5 text-primary" />
              Camera Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-xl bg-secondary/50 border border-border flex items-center justify-center relative overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover rounded-xl transition-opacity ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />
              <div className="pointer-events-none absolute inset-0">
                {detectionResult &&
                  detectionResult.persons.map((person, index) => (
                    <div
                      key={`${person.label}-${index}`}
                      className="absolute border border-success rounded-lg"
                      style={getOverlayStyles(person.box)}
                    >
                      <span className="bg-success text-white text-[10px] px-1 py-[1px] rounded-sm">
                        {person.label}
                      </span>
                    </div>
                  ))}
              </div>
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Camera preview will appear here</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <p>{statusMessage}</p>
              {lastUpdated && <p>Updated {lastUpdated.toLocaleTimeString()}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Count Display */}
        <Card variant="glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="w-5 h-5 text-primary" />
              People Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-8xl font-display font-bold text-gradient mb-4">
                {isActive ? detectionResult?.person_count ?? 0 : "—"}
              </div>
              <p className="text-xl text-muted-foreground">
                {isActive
                  ? `${detectionResult?.person_count ?? 0} people in view`
                  : "Start counting to see results"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <Card className="p-4 bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {detectionResult?.persons.length ?? 0}
                    </p>
                    <p className="text-sm text-muted-foreground">In frame</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                    <UserMinus className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">—</p>
                    <p className="text-sm text-muted-foreground">Left the frame</p>
                  </div>
                </div>
              </Card>
            </div>


          </CardContent>
        </Card>
      </div>

      {detectionResult && detectionResult.persons.length > 0 && (
        <Card variant="glow">
          <CardHeader>
            <CardTitle className="text-foreground">Detection Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {detectionResult.persons.map((person, index) => (
                <div key={`${person.label}-details-${index}`} className="rounded-lg border border-border p-3 space-y-1">
                  <p className="text-sm font-semibold text-foreground">{person.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Confidence: {(person.confidence * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Distance: {person.distance}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    Position: {person.position}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default PersonCounting;
