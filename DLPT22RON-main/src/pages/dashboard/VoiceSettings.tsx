import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, Globe, Play, Gauge } from "lucide-react";
import { useState } from "react";

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ar", name: "Arabic" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
];

const voiceTypes = [
  { id: "female1", name: "Female Voice 1" },
  { id: "female2", name: "Female Voice 2" },
  { id: "male1", name: "Male Voice 1" },
  { id: "male2", name: "Male Voice 2" },
];

const VoiceSettings = () => {
  const [language, setLanguage] = useState("en");
  const [voiceType, setVoiceType] = useState("female1");
  const [speed, setSpeed] = useState([1]);
  const [volume, setVolume] = useState([80]);

  const handleTestVoice = () => {
    // In a real app, this would use the Web Speech API
    alert("Testing voice: 'Hello, this is a test of the voice settings.'");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Voice Settings</h1>
        <p className="text-muted-foreground">Customize voice feedback preferences for your experience</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Language & Voice Selection */}
        <Card variant="glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Globe className="w-5 h-5 text-primary" />
              Language & Voice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Language */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Voice Type */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Voice Type</label>
              <Select value={voiceType} onValueChange={setVoiceType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {voiceTypes.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={handleTestVoice} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Test Voice
            </Button>
          </CardContent>
        </Card>

        {/* Speed & Volume */}
        <Card variant="glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Gauge className="w-5 h-5 text-primary" />
              Speed & Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Speed Control */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Voice Speed</label>
                <span className="text-sm text-muted-foreground">{speed[0]}x</span>
              </div>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Slower</span>
                <span>Normal</span>
                <span>Faster</span>
              </div>
            </div>

            {/* Volume Control */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Volume</label>
                <span className="text-sm text-muted-foreground">{volume[0]}%</span>
              </div>
              <Slider
                value={volume}
                onValueChange={setVolume}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Quiet</span>
                <span>Medium</span>
                <span>Loud</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Preview */}
        <Card variant="glow" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Volume2 className="w-5 h-5 text-primary" />
              Sample Phrases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Chair detected, 2 meters ahead",
                "Turn left in 5 meters",
                "Three people detected nearby",
                "500 rupee note detected",
                "Obstacle warning, step ahead",
                "Destination reached",
              ].map((phrase, index) => (
                <Button
                  key={index}
                  variant="secondary"
                  className="h-auto py-4 px-4 text-left justify-start"
                  onClick={() => alert(`Playing: "${phrase}"`)}
                >
                  <Volume2 className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="text-sm">{phrase}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceSettings;
