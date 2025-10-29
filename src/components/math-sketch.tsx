"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";

interface MathSketchProps {
    drawing: string;
    caption: string;
}

export function MathSketch({ drawing, caption }: MathSketchProps) {
    return (
        <Card className="mt-4 bg-background/50">
            <CardContent className="p-4">
                <div 
                    className="flex items-center justify-center text-foreground"
                    dangerouslySetInnerHTML={{ __html: drawing }} 
                />
            </CardContent>
            <CardFooter className="p-2 pt-0">
                <p className="text-xs text-muted-foreground text-center w-full">{caption}</p>
            </CardFooter>
        </Card>
    )
}
