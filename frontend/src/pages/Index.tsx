import { useState, useCallback, useEffect } from "react";
import { Upload, Music, Loader2, X, RotateCcw, Sparkles, History, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import musicBg from "@/assets/music-bg.jpg";
import spotifyLogo from "@/assets/spotify-logo.png";
import ClassificationHistory from "@/components/ClassificationHistory";
import StatsCard from "@/components/StatsCard";

const GENRES = ["Blues", "Classical", "Country", "Disco", "HipHop", "Jazz", "Metal", "Pop", "Reggae", "Rock"];

interface Classification {
  id: string;
  fileName: string;
  genre: string;
  confidence: number;
  timestamp: number;
}

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [predictedGenre, setPredictedGenre] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [history, setHistory] = useState<Classification[]>([]);
  const [fileSize, setFileSize] = useState<string>("");
  const { toast } = useToast();

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("classificationHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("classificationHistory", JSON.stringify(history));
    }
  }, [history]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (.mp3, .wav)",
        variant: "destructive",
      });
      return;
    }
    setSelectedFile(file);
    setPredictedGenre(null);
    setConfidence(0);
    
    // Format file size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setFileSize(`${sizeInMB} MB`);
    
    toast({
      title: "File uploaded",
      description: `${file.name} is ready to classify`,
    });
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPredictedGenre(null);
    setConfidence(0);
    setFileSize("");
    toast({
      title: "File cleared",
      description: "Upload a new file to classify",
    });
  };

  const classifyAnother = () => {
    setPredictedGenre(null);
    setConfidence(0);
    setSelectedFile(null);
    setFileSize("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const classifyGenre = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setPredictedGenre(null);
    setConfidence(0);

    try {
      // Create FormData to send file
      const formData = new FormData();
      formData.append('audio', selectedFile);

      // Make API call to backend
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const { predicted_genre, confidence: apiConfidence } = result.data;
        
        // Capitalize genre name for display
        const displayGenre = predicted_genre.charAt(0).toUpperCase() + predicted_genre.slice(1);
        const confidencePercentage = Math.round(apiConfidence * 100);
        
        setPredictedGenre(displayGenre);
        setConfidence(confidencePercentage);

        // Add to history
        const newClassification: Classification = {
          id: Date.now().toString(),
          fileName: selectedFile.name,
          genre: displayGenre,
          confidence: confidencePercentage,
          timestamp: Date.now(),
        };
        
        setHistory((prev) => [newClassification, ...prev]);

        toast({
          title: "Classification complete!",
          description: `Genre detected: ${displayGenre} (${confidencePercentage}% confidence)`,
        });
      } else {
        throw new Error(result.error || 'Classification failed');
      }
    } catch (error) {
      console.error('Classification error:', error);
      toast({
        title: "Classification failed",
        description: error instanceof Error ? error.message : "Please try again or check your connection",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={musicBg} alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="mb-8 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center gap-3 mb-2">
            <img src={spotifyLogo} alt="Spotify" className="w-10 h-10" />
            <h1 className="text-4xl font-bold text-foreground">
              Classify
            </h1>
          </div>
          <p className="text-muted-foreground ml-[52px]">
            Discover the genre of your music with AI-powered classification
          </p>
        </header>

        <Tabs defaultValue="classifier" className="w-full animate-in fade-in duration-700">
          <TabsList className="mb-8 bg-card border border-border">
            <TabsTrigger value="classifier" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Home className="w-4 h-4" />
              Classifier
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Classifier Tab */}
          <TabsContent value="classifier" className="space-y-8">
            {/* Stats Section */}
            {history.length > 0 && (
              <div className="animate-in fade-in slide-in-from-top duration-500">
                <StatsCard history={history} />
              </div>
            )}

            <div className="max-w-4xl mx-auto space-y-8">
              {/* Upload Section */}
              <Card className="p-8 bg-card border-border shadow-lg">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                    isDragging
                      ? "border-primary bg-primary/10 scale-105"
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    accept="audio/*,.mp3,.wav"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">
                      {selectedFile ? "File Uploaded" : "Drop your audio file here"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {selectedFile ? selectedFile.name : "or click to browse"}
                    </p>
                    {selectedFile && (
                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full text-primary">
                          <Music className="w-4 h-4" />
                          <span className="font-medium">{selectedFile.name}</span>
                        </div>
                        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                          <span>Size: {fileSize}</span>
                        </div>
                      </div>
                    )}
                  </label>
                  
                  {selectedFile && !predictedGenre && (
                    <Button
                      onClick={clearFile}
                      variant="outline"
                      className="mt-4 w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear File
                    </Button>
                  )}
                </div>

                {selectedFile && !predictedGenre && (
                  <Button
                    onClick={classifyGenre}
                    disabled={isProcessing}
                    className="w-full mt-6 h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-glow"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Classify Genre
                      </>
                    )}
                  </Button>
                )}
              </Card>

              {/* Results Section */}
              {predictedGenre && (
                <Card className="p-8 bg-card border-border shadow-lg animate-in fade-in slide-in-from-bottom duration-500">
                  <div className="text-center space-y-6">
                    <div>
                      <p className="text-muted-foreground mb-2">Predicted Genre</p>
                      <h2 className="text-5xl font-bold text-primary mb-4">
                        {predictedGenre}
                      </h2>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <p className="text-sm text-muted-foreground">
                          {confidence}% confidence
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={classifyAnother}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Classify Another
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-8">
            <div className="max-w-6xl mx-auto">
              {/* Stats Section */}
              {history.length > 0 && (
                <div className="mb-8 animate-in fade-in duration-500">
                  <StatsCard history={history} />
                </div>
              )}

              {/* History Section */}
              <ClassificationHistory history={history} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
