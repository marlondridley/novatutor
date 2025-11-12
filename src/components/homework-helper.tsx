"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Sparkles, Upload, Mic, FileText, Info, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/context/auth-context";
import { uploadHomeworkImage } from "@/lib/homework-storage";
import type { Subject } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HomeworkHelperProps {
  subject: Subject;
  onCheck: (imageDataUri: string) => void;
}

export function HomeworkHelper({ subject, onCheck }: HomeworkHelperProps) {
  const { user, supabaseUser } = useAuth();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [uploadMode, setUploadMode] = useState<'camera' | 'file' | 'voice'>('camera');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const requestCameraAccess = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        variant: 'destructive',
        title: 'Camera Not Supported',
        description: 'Your browser does not support camera access. Try uploading a file instead.',
      });
      setHasCameraPermission(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      toast({
        title: "Camera Access Granted!",
        description: "Point your camera at your homework and click 'Get Help'.",
      });
    } catch (error) {
      setHasCameraPermission(false);
      toast({
        variant: "destructive",
        title: "Camera Access Denied",
        description: "No worries! You can upload a photo or file instead.",
      });
    }
  };

  useEffect(() => {
    // Only auto-request on first load if user explicitly chose camera mode
    if (uploadMode === 'camera' && hasCameraPermission === null) {
      // Don't auto-request - let user click the button
      setHasCameraPermission(false);
    }
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [uploadMode, hasCameraPermission]);

  const captureHomework = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return null;

    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    return canvas.toDataURL("image/jpeg");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, etc.)",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageDataUri = e.target?.result as string;
      if (imageDataUri) {
        setIsChecking(true);
        
        // Upload image to Supabase Storage
        const userId = user?.id || supabaseUser?.id;
        if (userId) {
          try {
            await uploadHomeworkImage(imageDataUri, userId, subject);
          } catch (error) {
            // Non-blocking: continue with analysis even if storage fails
          }
        }
        
        onCheck(imageDataUri);
        setIsChecking(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCheckHomework = async () => {
    const imageDataUri = captureHomework();
    if (!imageDataUri) {
      toast({
        variant: "destructive",
        title: "Capture Failed",
        description: "Could not capture an image of your homework.",
      });
      return;
    }
    setIsChecking(true);
    
    // Upload image to Supabase Storage
    const userId = user?.id || supabaseUser?.id;
    if (userId) {
      try {
        const imageUrl = await uploadHomeworkImage(imageDataUri, userId, subject);
        if (imageUrl) {
          // Store URL could be saved to database for future reference
          // For now, we proceed with the image analysis
        }
      } catch (error) {
        // Non-blocking: continue with analysis even if storage fails
        // Error logged by uploadHomeworkImage function
      }
    }
    
    onCheck(imageDataUri);
    setIsChecking(false);
  };
  

  return (
    <div className="w-full h-full p-4">
      <Tabs defaultValue="camera" className="w-full" onValueChange={(v) => setUploadMode(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="camera">
            <Camera className="w-4 h-4 mr-2" />
            Camera
          </TabsTrigger>
          <TabsTrigger value="file">
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </TabsTrigger>
        </TabsList>

        {/* Camera Mode */}
        <TabsContent value="camera" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Snap Your Homework
              </CardTitle>
              <CardDescription>
                Point your camera at your work and click "Get Help"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full aspect-video bg-muted rounded-md relative overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
                
                {hasCameraPermission === false && (
                  <div className="absolute inset-0 flex items-center justify-center p-4 bg-background/95">
                    <div className="text-center space-y-4 max-w-sm">
                      <Alert>
                        <Lock className="h-4 w-4" />
                        <AlertTitle>Camera Access Needed</AlertTitle>
                        <AlertDescription className="space-y-3">
                          <p>Click the button below to enable your camera.</p>
                          <Button onClick={requestCameraAccess} variant="default" size="lg" className="w-full">
                            <Camera className="mr-2 h-4 w-4" />
                            Grant Camera Access
                          </Button>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs flex items-center justify-center gap-1 text-muted-foreground cursor-help">
                                  <Info className="w-3 h-3" />
                                  Don't see the permission popup?
                                </p>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-sm">
                                  Look for the <Lock className="w-3 h-3 inline" /> lock icon in your browser's address bar → 
                                  Click "Permissions" → Allow Camera → Refresh this page
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleCheckHomework} 
                disabled={isChecking || !hasCameraPermission} 
                size="lg"
                className="w-full"
              >
                {isChecking ? (
                  <>
                    <Sparkles className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2" />
                    Get Help
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* File Upload Mode */}
        <TabsContent value="file" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Your Work
              </CardTitle>
              <CardDescription>
                Upload a photo of your homework, notes, or worksheet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-primary/10 p-4">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isChecking}
                      size="lg"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports: JPG, PNG, HEIC, WebP
                    </p>
                  </div>
                </div>
              </div>

              {isChecking && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Processing your homework...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
