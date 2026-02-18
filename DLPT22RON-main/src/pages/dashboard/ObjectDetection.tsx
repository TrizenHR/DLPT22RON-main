import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Camera, Users, ChevronDown, TrafficCone, Upload, Loader2, ImageIcon, X, Image as LucideImage } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const BACKEND_URL = "http://localhost:5000";
const API_BASE_URL = "http://localhost:5000/api";
const DETECTION_INTERVAL = 1500;

interface Detection {
  label: string;
  confidence: number;
  position: string;
  distance: string | null;
  box: number[];
  type?: "object" | "person" | "traffic_sign";
}

interface DetectionResult {
  objects: Detection[];
  persons: Detection[];
  traffic_signs: Detection[];
  personCount: number;
  frame_height: number;
  frame_width: number;
}

interface VideoScreenshot {
  filename: string;
  url: string;
  frame_number: number;
  timestamp: string;
  objects_count: number;
  persons_count: number;
  traffic_signs_count: number;
}

interface VideoResult {
  total_frames_processed: number;
  total_video_frames: number;
  fps: number;
  summary: {
    total_objects: number;
    total_persons: number;
    total_traffic_signs: number;
  };
  screenshots: VideoScreenshot[];
}

interface ImageResult {
  url: string;
  width: number;
  height: number;
  summary: {
    total_objects: number;
    total_persons: number;
    total_traffic_signs: number;
  };
  detections: {
    objects: Detection[];
    persons: Detection[];
    traffic_signs: Detection[];
  };
}

const ObjectDetection = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [statusMessage, setStatusMessage] = useState("Camera idle");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Video upload state
  const [isUploading, setIsUploading] = useState(false);
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  // Image upload state
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageResult, setImageResult] = useState<ImageResult | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionTimerRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);
  const isDetectingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const stopDetectionLoop = () => {
    if (detectionTimerRef.current) {
      window.clearInterval(detectionTimerRef.current);
      detectionTimerRef.current = null;
    }
    isProcessingRef.current = false;
  };

  const detectFrame = async () => {
    if (isProcessingRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const videoWidth = video.videoWidth || video.clientWidth;
    const videoHeight = video.videoHeight || video.clientHeight;
    if (!videoWidth || !videoHeight) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = videoWidth;
    canvas.height = videoHeight;
    context.drawImage(video, 0, 0, videoWidth, videoHeight);

    const frame = canvas.toDataURL("image/jpeg", 0.7);
    isProcessingRef.current = true;
    setStatusMessage("Analyzing frame…");

    try {
      const response = await fetch(`${BACKEND_URL}/detect_frame`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame }),
      });

      if (!response.ok) throw new Error("Detection failed");

      const data = await response.json();

      const result: DetectionResult = {
        objects: data.objects || [],
        persons: data.persons || [],
        traffic_signs: data.traffic_signs || [],
        personCount: data.person_count || 0,
        frame_height: data.frame_height || videoHeight,
        frame_width: data.frame_width || videoWidth,
      };

      setDetectionResult(result);
      setLastUpdated(new Date());

      const parts: string[] = [];
      if (result.objects.length > 0) parts.push(`${result.objects.length} object${result.objects.length > 1 ? "s" : ""}`);
      if (result.personCount > 0) parts.push(`${result.personCount} person${result.personCount > 1 ? "s" : ""}`);
      if (result.traffic_signs.length > 0) parts.push(`${result.traffic_signs.length} sign${result.traffic_signs.length > 1 ? "s" : ""}`);
      setStatusMessage(parts.length > 0 ? parts.join(", ") + " detected" : "No detections");
    } catch (error) {
      console.error("Detection error:", error);
      setStatusMessage("Detection failed. Retrying…");
    } finally {
      isProcessingRef.current = false;
    }
  };

  const startDetectionLoop = () => {
    if (detectionTimerRef.current) return;
    detectFrame();
    detectionTimerRef.current = window.setInterval(() => detectFrame(), DETECTION_INTERVAL);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          isDetectingRef.current = true;
          setIsDetecting(true);
          setStatusMessage("Camera ready. Scanning for objects…");
          startDetectionLoop();
        };
      }
      toast.success("Camera started");
    } catch (error) {
      console.error("Error accessing camera:", error);
      setStatusMessage("Camera permission denied");
      toast.error("Failed to access camera. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    stopDetectionLoop();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    isDetectingRef.current = false;
    setIsDetecting(false);
    setDetectionResult(null);
    setStatusMessage("Camera idle");
    setLastUpdated(null);

    toast.info("Camera stopped");
  };

  // ── Video upload ──
  const handleUploadClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["video/mp4", "video/avi", "video/quicktime", "video/x-matroska", "video/webm"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(mp4|avi|mov|mkv|webm)$/i)) {
      toast.error("Please upload a valid video file (mp4, avi, mov, mkv, webm)");
      return;
    }

    setIsUploading(true);
    setVideoResult(null);
    setStatusMessage(`Processing video: ${file.name}…`);
    toast.info(`Uploading "${file.name}"… This may take a minute.`);

    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await fetch(`${API_BASE_URL}/video/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }

      const data: VideoResult = await response.json();
      setVideoResult(data);
      setStatusMessage(
        `Video processed: ${data.summary.total_objects} objects, ${data.summary.total_persons} persons, ${data.summary.total_traffic_signs} signs`
      );
      toast.success(`Video processed! ${data.total_frames_processed} frames analyzed.`);
    } catch (error: any) {
      console.error("Video upload error:", error);
      setStatusMessage("Video processing failed");
      toast.error(error.message || "Failed to process video");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Image upload ──
  const handleImageUploadClick = () => {
    if (isImageUploading) return;
    imageInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/bmp"];
    if (!allowed.includes(file.type)) {
      toast.error("Please upload a valid image file (jpg, png, webp, bmp)");
      return;
    }

    setIsImageUploading(true);
    setImageResult(null);
    setStatusMessage(`Processing image: ${file.name}…`);
    toast.info(`Uploading "${file.name}"…`);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${API_BASE_URL}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }

      const data: ImageResult = await response.json();
      setImageResult(data);
      setStatusMessage(
        `Image processed: ${data.summary.total_objects} objects, ${data.summary.total_persons} persons, ${data.summary.total_traffic_signs} signs`
      );
      toast.success("Image analysis complete!");
    } catch (error: any) {
      console.error("Image upload error:", error);
      setStatusMessage("Image processing failed");
      toast.error(error.message || "Failed to process image");
    } finally {
      setIsImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      stopDetectionLoop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const getOverlayStyles = (box: number[]) => {
    if (!detectionResult || !videoRef.current) return {};

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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-4 gap-6">
      {/* ── Live Camera Card ── */}
      <Card variant="glow" className="w-full max-w-4xl">
        <CardContent className="p-4 space-y-4">
          <div className="relative aspect-video rounded-xl bg-secondary/50 border border-border overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover rounded-xl transition-opacity ${
                isDetecting ? "opacity-100" : "opacity-0"
              }`}
            />
            <div className="pointer-events-none absolute inset-0">
              {detectionResult && (
                <>
                  {detectionResult.objects.map((object, index) => (
                    <div
                      key={`object-${object.label}-${index}`}
                      className="absolute border-2 border-success rounded-lg"
                      style={getOverlayStyles(object.box)}
                    >
                      <span className="bg-success text-white text-[10px] px-1 py-[1px] rounded-sm">
                        {object.label} ({(object.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                  {detectionResult.persons.map((person, index) => (
                    <div
                      key={`person-${person.label}-${index}`}
                      className="absolute border-2 border-primary rounded-lg"
                      style={getOverlayStyles(person.box)}
                    >
                      <span className="bg-primary text-primary-foreground text-[10px] px-1 py-[1px] rounded-sm">
                        {person.label} ({(person.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                  {detectionResult.traffic_signs.map((sign, index) => (
                    <div
                      key={`sign-${sign.label}-${index}`}
                      className="absolute border-2 border-blue-500 rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      style={getOverlayStyles(sign.box)}
                    >
                      <span className="bg-blue-500 text-white text-[10px] px-1 py-[1px] rounded-sm">
                        🚦 {sign.label} ({(sign.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
            {!isDetecting && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Camera preview will appear here</p>
                  <p className="text-sm text-muted-foreground mt-2">Click "Start Detection" to begin</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <p className="text-muted-foreground">{statusMessage}</p>
              {lastUpdated && (
                <p className="text-muted-foreground">{`Updated ${lastUpdated.toLocaleTimeString()}`}</p>
              )}
            </div>

            {/* Summary Stats */}
            {detectionResult && (detectionResult.objects.length > 0 || detectionResult.personCount > 0 || detectionResult.traffic_signs.length > 0) && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border bg-background/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Camera className="w-4 h-4 text-success" />
                    <p className="text-xs text-muted-foreground">Objects</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{detectionResult.objects.length}</p>
                </div>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">People</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{detectionResult.personCount}</p>
                </div>
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrafficCone className="w-4 h-4 text-blue-500" />
                    <p className="text-xs text-muted-foreground">Signs</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{detectionResult.traffic_signs.length}</p>
                </div>
              </div>
            )}

            {/* Collapsible Detection Details */}
            {detectionResult && (detectionResult.objects.length > 0 || detectionResult.persons.length > 0 || detectionResult.traffic_signs.length > 0) && (
              <div className="space-y-2">
                {detectionResult.persons.length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">People ({detectionResult.persons.length})</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {detectionResult.persons.map((person, index) => (
                          <div key={`person-detail-${person.label}-${index}`} className="rounded-lg border border-primary/30 bg-primary/5 p-2 space-y-1 text-xs">
                            <p className="font-semibold text-foreground">{person.label}</p>
                            <p className="text-muted-foreground">
                              {(person.confidence * 100).toFixed(1)}% • {person.distance} • {person.position}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {detectionResult.objects.length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg border border-success/30 bg-success/5 hover:bg-success/10 transition-colors">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-success" />
                        <span className="text-sm font-semibold text-foreground">Objects ({detectionResult.objects.length})</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {detectionResult.objects.slice(0, 6).map((object, index) => (
                          <div key={`object-detail-${object.label}-${index}`} className="rounded-lg border border-success/30 bg-success/5 p-2 space-y-1 text-xs">
                            <p className="font-semibold text-foreground">{object.label}</p>
                            <p className="text-muted-foreground">
                              {(object.confidence * 100).toFixed(1)}% • {object.distance ?? "Unknown"} • {object.position}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {detectionResult.traffic_signs.length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                      <div className="flex items-center gap-2">
                        <TrafficCone className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-semibold text-foreground">Traffic Signs ({detectionResult.traffic_signs.length})</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {detectionResult.traffic_signs.map((sign, index) => (
                          <div key={`sign-detail-${sign.label}-${index}`} className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-2 space-y-1 text-xs">
                            <p className="font-semibold text-foreground">🚦 {sign.label}</p>
                            <p className="text-muted-foreground">
                              {(sign.confidence * 100).toFixed(1)}% • {sign.distance ?? "Unknown"} • {sign.position}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant={isDetecting ? "destructive" : "hero"}
              size="lg"
              onClick={isDetecting ? stopCamera : startCamera}
              className="min-w-48"
            >
              {isDetecting ? "Stop Detection" : "Start Detection"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="min-w-48 border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoUpload}
            />
            <Button
              variant="outline"
              size="lg"
              onClick={handleImageUploadClick}
              disabled={isImageUploading}
              className="min-w-48 border-success/50 text-success hover:bg-success/10"
            >
              {isImageUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <LucideImage className="w-4 h-4 mr-2" />
                  Upload Image
                </>
              )}
            </Button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Video Upload Results ── */}
      {(isUploading || videoResult) && (
        <Card variant="glow" className="w-full max-w-4xl">
          <CardContent className="p-4 space-y-4">
            {isUploading && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-muted-foreground font-medium">Processing video… This may take a minute.</p>
                <p className="text-xs text-muted-foreground">Extracting frames, running YOLO detection, drawing bounding boxes</p>
              </div>
            )}

            {videoResult && !isUploading && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-500" />
                    Video Analysis Results
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setVideoResult(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="rounded-lg border border-border bg-background/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Frames</p>
                    <p className="text-2xl font-bold text-foreground">{videoResult.total_frames_processed}</p>
                  </div>
                  <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Objects</p>
                    <p className="text-2xl font-bold text-success">{videoResult.summary.total_objects}</p>
                  </div>
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Persons</p>
                    <p className="text-2xl font-bold text-primary">{videoResult.summary.total_persons}</p>
                  </div>
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Signs</p>
                    <p className="text-2xl font-bold text-blue-500">{videoResult.summary.total_traffic_signs}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-3">
                    Annotated Screenshots ({videoResult.screenshots.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {videoResult.screenshots.map((ss, idx) => (
                      <div
                        key={idx}
                        className="group relative rounded-lg border border-border overflow-hidden cursor-pointer hover:border-blue-500/50 transition-colors"
                        onClick={() => setSelectedScreenshot(
                          selectedScreenshot === `${BACKEND_URL}${ss.url}` ? null : `${BACKEND_URL}${ss.url}`
                        )}
                      >
                        <img src={`${BACKEND_URL}${ss.url}`} alt={`Frame at ${ss.timestamp}`} className="w-full aspect-video object-cover" loading="lazy" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 text-[10px] text-white">
                          <span>{ss.timestamp}</span>
                          <span className="float-right">{ss.objects_count + ss.persons_count + ss.traffic_signs_count} detections</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedScreenshot && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSelectedScreenshot(null)}>
                    <div className="relative max-w-[90vw] max-h-[90vh]">
                      <img src={selectedScreenshot} alt="Full-size annotated screenshot" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
                      <Button variant="ghost" size="sm" className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70" onClick={() => setSelectedScreenshot(null)}>
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Image Upload Results ── */}
      {(isImageUploading || imageResult) && (
        <Card variant="glow" className="w-full max-w-7xl">
          <CardContent className="p-4 space-y-4">
            {isImageUploading && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-12 h-12 text-success animate-spin" />
                <p className="text-muted-foreground font-medium">Processing image…</p>
                <p className="text-xs text-muted-foreground">Running detection and generating annotations</p>
              </div>
            )}

            {imageResult && !isImageUploading && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <LucideImage className="w-5 h-5 text-success" />
                    Image Analysis Results
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setImageResult(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="rounded-lg border border-border bg-background/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Resolution</p>
                    <p className="text-lg font-bold text-foreground">{imageResult.width} x {imageResult.height}</p>
                  </div>
                  <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Objects</p>
                    <p className="text-2xl font-bold text-success">{imageResult.summary.total_objects}</p>
                  </div>
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Persons</p>
                    <p className="text-2xl font-bold text-primary">{imageResult.summary.total_persons}</p>
                  </div>
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Signs</p>
                    <p className="text-2xl font-bold text-blue-500">{imageResult.summary.total_traffic_signs}</p>
                  </div>
                </div>

                <div className="relative rounded-lg border border-border overflow-hidden">
                  <img 
                    src={`${BACKEND_URL}${imageResult.url}`} 
                    alt="Analyzed Image" 
                    className="w-full h-auto object-contain rounded-lg" 
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ObjectDetection;