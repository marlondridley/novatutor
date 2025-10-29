"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Subject } from "@/lib/types";

interface HomeworkHelperProps {
  subject: Subject;
  onCheck: (imageDataUri: string) => void;
}

export function HomeworkHelper({ subject, onCheck }: HomeworkHelperProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
            variant: 'destructive',
            title: 'Camera Not Supported',
            description: 'Your browser does not support camera access.',
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
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description: "Please enable camera permissions in your browser settings to use this app.",
        });
      }
    };

    getCameraPermission();
    
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

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
    onCheck(imageDataUri);
    setIsChecking(false);
  };
  

  return (
    <div className="flex flex-col gap-4 items-center justify-center p-4 h-full">
        <div className="w-full max-w-md aspect-video bg-muted rounded-md relative overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            {hasCameraPermission === false && (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <Alert variant="destructive">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access to use this feature. You may need to
                        change permissions in your browser settings and refresh the page.
                    </AlertDescription>
                    </Alert>
                </div>
            )}
             {hasCameraPermission === null && (
                <div className="absolute inset-0 flex items-center justify-center p-4 bg-background/80">
                    <p>Loading camera...</p>
                </div>
            )}
        </div>
          <Button onClick={handleCheckHomework} disabled={isChecking || !hasCameraPermission} size="lg">
            {isChecking ? (<><Sparkles className="animate-spin mr-2"/>Processing...</>) : <><Camera className="mr-2"/>Get Help</>}
          </Button>
      </div>
  );
}
