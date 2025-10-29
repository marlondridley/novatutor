import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Coffee, Wind, Move, Music } from "lucide-react";

const focusTips = [
    {
        icon: <Coffee className="w-8 h-8 text-accent-foreground" />,
        title: "Take a Short Break",
        description: "Step away for 5-10 minutes to refresh your mind. Grab a drink or a healthy snack."
    },
    {
        icon: <Wind className="w-8 h-8 text-accent-foreground" />,
        title: "Mindful Breathing",
        description: "Practice 2 minutes of deep breathing. Inhale for 4 seconds, hold for 4, and exhale for 6."
    },
    {
        icon: <Move className="w-8 h-8 text-accent-foreground" />,
        title: "Stretch Your Body",
        description: "Stand up and do some simple stretches. Focus on your neck, shoulders, and back."
    },
    {
        icon: <Music className="w-8 h-8 text-accent-foreground" />,
        title: "Focus Music",
        description: "Listen to some calming instrumental music or white noise to block out distractions."
    }
]

export function FocusHelp() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {focusTips.map((tip, index) => (
            <Card key={index} className="hover:border-primary hover:shadow-lg transition-all">
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="p-3 bg-accent rounded-lg">
                        {tip.icon}
                    </div>
                    <div>
                        <CardTitle>{tip.title}</CardTitle>
                        <CardDescription className="mt-1">{tip.description}</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        ))}
    </div>
  );
}
