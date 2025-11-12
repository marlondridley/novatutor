'use client';

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coffee, Wind, Move, Music, ExternalLink, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FocusTip {
    icon: React.ReactNode;
    title: string;
    description: string;
    duration: string;
    detailedInstructions: {
        step: number;
        instruction: string;
        tip?: string;
    }[];
    benefits: string[];
    musicLinks?: {
        title: string;
        url: string;
        description: string;
    }[];
}

const focusTips: FocusTip[] = [
    {
        icon: <Coffee className="w-8 h-8 text-accent-foreground" />,
        title: "Take a Short Break",
        description: "Step away for 5-10 minutes to refresh your mind. Grab a drink or a healthy snack.",
        duration: "5-10 minutes",
        detailedInstructions: [
            {
                step: 1,
                instruction: "Save your work and close any study materials",
                tip: "Make sure you won't lose any progress"
            },
            {
                step: 2,
                instruction: "Stand up and step away from your study space",
                tip: "Physical distance helps mental distance"
            },
            {
                step: 3,
                instruction: "Do a light activity: walk around, get water, have a healthy snack",
                tip: "Avoid screens during your break"
            },
            {
                step: 4,
                instruction: "Look out a window or go outside if possible",
                tip: "Natural light and fresh air boost focus"
            },
            {
                step: 5,
                instruction: "Set a timer for 5-10 minutes so you don't lose track of time"
            },
            {
                step: 6,
                instruction: "When the timer goes off, return to your study space with renewed focus"
            }
        ],
        benefits: [
            "Prevents mental fatigue and burnout",
            "Improves information retention",
            "Reduces eye strain from screen time",
            "Boosts creativity and problem-solving"
        ]
    },
    {
        icon: <Wind className="w-8 h-8 text-accent-foreground" />,
        title: "Mindful Breathing",
        description: "Practice 2 minutes of deep breathing. Inhale for 4 seconds, hold for 4, and exhale for 6.",
        duration: "2-5 minutes",
        detailedInstructions: [
            {
                step: 1,
                instruction: "Sit comfortably in your chair with your feet flat on the floor",
                tip: "Keep your back straight but relaxed"
            },
            {
                step: 2,
                instruction: "Close your eyes or lower your gaze to reduce distractions"
            },
            {
                step: 3,
                instruction: "Place one hand on your chest and one on your belly"
            },
            {
                step: 4,
                instruction: "Breathe in slowly through your nose for 4 seconds",
                tip: "Feel your belly expand, not just your chest"
            },
            {
                step: 5,
                instruction: "Hold your breath gently for 4 seconds",
                tip: "Don't strain - it should feel comfortable"
            },
            {
                step: 6,
                instruction: "Exhale slowly through your mouth for 6 seconds",
                tip: "Imagine releasing tension with each breath out"
            },
            {
                step: 7,
                instruction: "Repeat this cycle 5-10 times",
                tip: "If your mind wanders, gently bring attention back to your breath"
            },
            {
                step: 8,
                instruction: "When finished, take a moment to notice how you feel before resuming work"
            }
        ],
        benefits: [
            "Reduces stress and anxiety immediately",
            "Increases oxygen to the brain for better thinking",
            "Calms the nervous system",
            "Improves concentration and focus"
        ]
    },
    {
        icon: <Move className="w-8 h-8 text-accent-foreground" />,
        title: "Stretch Your Body",
        description: "Stand up and do some simple stretches. Focus on your neck, shoulders, and back.",
        duration: "3-5 minutes",
        detailedInstructions: [
            {
                step: 1,
                instruction: "Stand up and shake out your arms and legs gently"
            },
            {
                step: 2,
                instruction: "Neck rolls: Slowly roll your head in a circle 5 times each direction",
                tip: "Move slowly and gently - no forcing"
            },
            {
                step: 3,
                instruction: "Shoulder shrugs: Raise shoulders to ears, hold 3 seconds, release. Repeat 5 times",
                tip: "Really exaggerate the release to feel tension melt away"
            },
            {
                step: 4,
                instruction: "Shoulder rolls: Roll shoulders backward in big circles 10 times",
                tip: "Then reverse and roll forward 10 times"
            },
            {
                step: 5,
                instruction: "Arm reaches: Clasp hands above head and reach up tall, hold 10 seconds"
            },
            {
                step: 6,
                instruction: "Side bends: Keep arms raised, lean gently to each side, hold 5 seconds each"
            },
            {
                step: 7,
                instruction: "Torso twist: Place hands on hips, gently twist left and right 10 times each way"
            },
            {
                step: 8,
                instruction: "Forward fold: Bend forward and let arms dangle, hold 10 seconds",
                tip: "Let gravity do the work - this releases back tension"
            },
            {
                step: 9,
                instruction: "Take a few deep breaths and return to your seat feeling refreshed"
            }
        ],
        benefits: [
            "Relieves muscle tension from sitting",
            "Improves blood circulation",
            "Increases energy and alertness",
            "Prevents stiffness and posture problems"
        ]
    },
    {
        icon: <Music className="w-8 h-8 text-accent-foreground" />,
        title: "Focus Music",
        description: "Listen to some calming instrumental music or white noise to block out distractions.",
        duration: "Ongoing",
        detailedInstructions: [
            {
                step: 1,
                instruction: "Choose instrumental music without lyrics",
                tip: "Lyrics can be distracting when studying"
            },
            {
                step: 2,
                instruction: "Set volume to a comfortable background level",
                tip: "You should barely notice it - not too loud!"
            },
            {
                step: 3,
                instruction: "Use headphones if you're in a noisy environment",
                tip: "Over-ear headphones work best for blocking external sounds"
            },
            {
                step: 4,
                instruction: "Choose music that matches your task",
                tip: "Classical or ambient for reading/writing, lo-fi or jazz for problem-solving"
            },
            {
                step: 5,
                instruction: "Click one of the recommended playlists below to start"
            },
            {
                step: 6,
                instruction: "Let the music play in the background as you work",
                tip: "Most focus music is designed to loop seamlessly"
            }
        ],
        benefits: [
            "Blocks out distracting background noise",
            "Creates a consistent study environment",
            "Can improve mood and motivation",
            "Helps signal your brain it's time to focus"
        ],
        musicLinks: [
            {
                title: "Classical Music for Studying & Brain Power",
                url: "https://www.youtube.com/watch?v=jgpJVI3tDbY",
                description: "Mozart, Bach, and other classical composers - proven to help concentration"
            },
            {
                title: "Peaceful Piano - Relaxing Classical Music",
                url: "https://www.youtube.com/watch?v=RNqd1bY7dGk",
                description: "Beautiful piano pieces perfect for studying and focus"
            },
            {
                title: "Smooth Jazz for Study & Work",
                url: "https://www.youtube.com/watch?v=Dx5qFachd3A",
                description: "Relaxing jazz instrumental music to help you concentrate"
            },
            {
                title: "Chill Jazz Music - Coffee Shop Ambience",
                url: "https://www.youtube.com/watch?v=bmVKaAV_7-A",
                description: "Smooth jazz with coffee shop background sounds"
            },
            {
                title: "Study Classical Music Playlist",
                url: "https://www.youtube.com/watch?v=--tFFz44zWI",
                description: "3+ hours of the best classical music for studying and focus"
            },
            {
                title: "Lo-Fi Beats to Study/Relax To",
                url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
                description: "Chill hip-hop beats perfect for background studying"
            }
        ]
    }
];

export function FocusHelp() {
    const [selectedTip, setSelectedTip] = useState<FocusTip | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleCardClick = (tip: FocusTip) => {
        setSelectedTip(tip);
        setIsDialogOpen(true);
    };

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {focusTips.map((tip, index) => (
                    <Card 
                        key={index} 
                        className="hover:border-primary hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => handleCardClick(tip)}
                    >
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="p-3 bg-accent rounded-lg">
                                {tip.icon}
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-base">{tip.title}</CardTitle>
                                <CardDescription className="mt-1 text-xs">{tip.description}</CardDescription>
                                <Badge variant="secondary" className="mt-2 text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {tip.duration}
                                </Badge>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {/* Detailed Instructions Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    {selectedTip && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-3 bg-accent rounded-lg">
                                        {selectedTip.icon}
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl">{selectedTip.title}</DialogTitle>
                                        <Badge variant="secondary" className="mt-2">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {selectedTip.duration}
                                        </Badge>
                                    </div>
                                </div>
                                <DialogDescription className="text-base">
                                    {selectedTip.description}
                                </DialogDescription>
                            </DialogHeader>

                            {/* Step-by-Step Instructions */}
                            <div className="mt-6">
                                <h3 className="font-semibold text-lg mb-4">📋 Step-by-Step Instructions</h3>
                                <div className="space-y-4">
                                    {selectedTip.detailedInstructions.map((instruction) => (
                                        <div key={instruction.step} className="flex gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                                                {instruction.step}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{instruction.instruction}</p>
                                                {instruction.tip && (
                                                    <p className="text-xs text-muted-foreground mt-1 italic">
                                                        💡 Tip: {instruction.tip}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Music Links (if available) */}
                            {selectedTip.musicLinks && selectedTip.musicLinks.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-semibold text-lg mb-4">🎵 Recommended Music</h3>
                                    <div className="space-y-3">
                                        {selectedTip.musicLinks.map((link, index) => (
                                            <Card key={index} className="hover:bg-accent/50 transition-colors">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-sm mb-1">{link.title}</h4>
                                                            <p className="text-xs text-muted-foreground">{link.description}</p>
                                                        </div>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => window.open(link.url, '_blank')}
                                                            className="flex-shrink-0"
                                                        >
                                                            <ExternalLink className="w-4 h-4 mr-1" />
                                                            Listen
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Benefits */}
                            <div className="mt-6">
                                <h3 className="font-semibold text-lg mb-4">✨ Benefits</h3>
                                <div className="grid gap-2">
                                    {selectedTip.benefits.map((benefit, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="mt-6 flex justify-end">
                                <Button onClick={() => setIsDialogOpen(false)}>
                                    Got it, let's focus! 💪
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
