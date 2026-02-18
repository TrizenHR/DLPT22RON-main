import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Languages, ArrowRightLeft, Volume2, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5000/api";

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "te", name: "Telugu (తెలుగు)" },
  { code: "ja", name: "Japanese (日本語)" },
  { code: "zh", name: "Chinese (中文)" },
  { code: "es", name: "Spanish (Español)" },
];

const Translation = () => {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("te");
  const [isTranslating, setIsTranslating] = useState(false);
  const [userLanguage, setUserLanguage] = useState<string>("en");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchUserLanguage = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/profile`);
        if (response.ok) {
          const data = await response.json();
          setUserLanguage(data.language || "en");
          // Set target language to user's preferred language by default
          if (data.language) {
            setTargetLang(data.language);
          }
        }
      } catch (error) {
        console.error("Error fetching user language:", error);
      }
    };
    fetchUserLanguage();
  }, []);

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast.error("Please enter text to translate");
      return;
    }

    if (sourceLang === targetLang) {
      toast.error("Source and target languages must be different");
      return;
    }

    setIsTranslating(true);
    setTranslatedText("");

    try {
      const response = await fetch(`${API_BASE_URL}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: sourceText,
          source_lang: sourceLang,
          target_lang: targetLang,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Translation failed");
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      setTranslatedText(result.translation || "");
      toast.success("Translation completed");
    } catch (error) {
      console.error("Translation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to translate");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceText && translatedText) {
      // Swap the texts
      const tempText = sourceText;
      setSourceText(translatedText);
      setTranslatedText(tempText);
    }
    // Swap the languages
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
  };

  const handleSpeak = async (text: string, language: string) => {
    if (!text.trim() || isSpeaking) {
      return;
    }

    setIsSpeaking(true);

    try {
      const response = await fetch(`${API_BASE_URL}/speak`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
        toast.error("Failed to play audio");
      };
    } catch (error) {
      console.error("Error speaking text:", error);
      toast.error("Failed to generate speech");
      setIsSpeaking(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Translation</h1>
        <p className="text-muted-foreground">Translate text between multiple languages</p>
      </div>

      {/* Language Selection */}
      <Card variant="glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Languages className="w-5 h-5 text-primary" />
            Language Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="source-lang">From</Label>
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger id="source-lang">
                  <SelectValue placeholder="Select source language" />
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

            <div className="flex justify-center pb-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapLanguages}
                className="rounded-full"
                title="Swap languages"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-lang">To</Label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger id="target-lang">
                  <SelectValue placeholder="Select target language" />
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
          </div>
        </CardContent>
      </Card>

      {/* Translation Area */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Source Text */}
        <Card variant="glow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Source Text</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSpeak(sourceText, sourceLang)}
                  disabled={!sourceText.trim() || isSpeaking}
                  title="Listen to source text"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                {sourceText && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(sourceText)}
                    title="Copy source text"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter text to translate..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            <div className="flex justify-between items-center mt-4">
              <p className="text-xs text-muted-foreground">
                {sourceText.length} characters
              </p>
              <Button
                variant="hero"
                onClick={handleTranslate}
                disabled={!sourceText.trim() || isTranslating || sourceLang === targetLang}
              >
                {isTranslating ? "Translating..." : "Translate"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Translated Text */}
        <Card variant="glow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Translation</CardTitle>
              <div className="flex items-center gap-2">
                {translatedText && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSpeak(translatedText, targetLang)}
                      disabled={isSpeaking}
                      title="Listen to translation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(translatedText)}
                      title="Copy translation"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] p-3 rounded-lg border border-border bg-secondary/30">
              {isTranslating ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : translatedText ? (
                <p className="text-foreground whitespace-pre-wrap">{translatedText}</p>
              ) : (
                <p className="text-muted-foreground">Translation will appear here...</p>
              )}
            </div>
            {translatedText && (
              <div className="flex justify-end items-center mt-4">
                <p className="text-xs text-muted-foreground">
                  {translatedText.length} characters
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Translation;
