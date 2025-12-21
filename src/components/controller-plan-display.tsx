import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Star, Play, Pause, RotateCcw, Zap, Trophy, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';
import { useState, useEffect, useRef, useCallback } from 'react';
import { speakNaturally } from '@/lib/natural-speech';

interface PlanTask {
  task: string;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed?: boolean;
  subject?: string;
}

interface ControllerPlanDisplayProps {
  plan: PlanTask[];
  onStartQuest?: () => void;
  onTaskComplete?: (taskIndex: number) => void;
}

// Motivational ping messages
const PING_MESSAGES = [
  "🎯 You're doing great! Keep that focus!",
  "💪 Awesome work! You've got this!",
  "🧠 Your brain is working hard! Take a breath.",
  "⭐ Stay focused, you're making progress!",
  "🚀 You're crushing it! Keep going!",
  "🌟 Great concentration! Almost there!",
  "💡 Remember: one step at a time!",
  "🏆 Champions focus like you're doing now!",
  "🎉 You're doing amazing! Proud of you!",
  "🔥 On fire! Keep up the momentum!",
];

// Voice encouragement messages (shorter for TTS)
const VOICE_PINGS = [
  "Great focus! Keep it up!",
  "You're doing awesome!",
  "Stay strong, you've got this!",
  "Excellent work! Keep going!",
  "You're making great progress!",
];

export function ControllerPlanDisplay({ plan, onStartQuest, onTaskComplete }: ControllerPlanDisplayProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  
  // 🕐 SESSION TIMER STATE
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [totalSessionTime, setTotalSessionTime] = useState(0);
  const [pingCount, setPingCount] = useState(0);
  const [showPing, setShowPing] = useState(false);
  const [currentPingMessage, setCurrentPingMessage] = useState('');
  
  const pingTimersRef = useRef<NodeJS.Timeout[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate total session time from all tasks
  const totalPlanTime = plan.reduce((sum, task) => sum + task.estimatedTime, 0);

  // 🎯 START THE STUDY SESSION with random pings
  const startSession = useCallback(() => {
    if (plan.length === 0) return;

    const currentTask = plan[currentTaskIndex];
    const taskTimeSeconds = currentTask.estimatedTime * 60;
    
    setTimeRemaining(taskTimeSeconds);
    setTotalSessionTime(taskTimeSeconds);
    setIsSessionActive(true);
    setIsPaused(false);
    setPingCount(0);
    
    // 🔔 Schedule 5 random pings during the session
    const pingIntervals: number[] = [];
    const minPingTime = 3 * 60 * 1000; // 3 minutes minimum
    const maxPingTime = Math.min(taskTimeSeconds * 1000, currentTask.estimatedTime * 60 * 1000);
    
    // Generate 5 random ping times
    for (let i = 0; i < 5; i++) {
      const randomTime = Math.floor(Math.random() * (maxPingTime - minPingTime)) + minPingTime;
      pingIntervals.push(randomTime);
    }
    
    // Sort and schedule pings
    pingIntervals.sort((a, b) => a - b);
    pingTimersRef.current = pingIntervals.map((time, index) => 
      setTimeout(() => {
        triggerPing(index + 1);
      }, time)
    );
    
    // Start the countdown timer
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up for this task!
          handleTaskTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Announce start
    speakNaturally(`Let's rock and roll! Starting ${currentTask.task}. You have ${currentTask.estimatedTime} minutes. I'll check in with you along the way!`, 'encouragement');
    
    onStartQuest?.();
  }, [plan, currentTaskIndex, onStartQuest]);

  // 🔔 Trigger a motivational ping
  const triggerPing = useCallback((pingNumber: number) => {
    const message = PING_MESSAGES[Math.floor(Math.random() * PING_MESSAGES.length)];
    const voiceMessage = VOICE_PINGS[Math.floor(Math.random() * VOICE_PINGS.length)];
    
    setCurrentPingMessage(message);
    setShowPing(true);
    setPingCount(pingNumber);
    
    // Play ping sound and speak encouragement
    speakNaturally(voiceMessage, 'encouragement');
    
    // Hide ping after 4 seconds
    setTimeout(() => setShowPing(false), 4000);
  }, []);

  // ⏰ Handle when task time is up
  const handleTaskTimeUp = useCallback(() => {
    clearInterval(timerIntervalRef.current!);
    pingTimersRef.current.forEach(timer => clearTimeout(timer));
    
    speakNaturally("Time's up! Great work on this task. Click Done when you're ready!", 'celebration');
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  // ⏸️ Pause/Resume session
  const togglePause = useCallback(() => {
    if (isPaused) {
      // Resume
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTaskTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      speakNaturally("Let's get back to it!", 'encouragement');
    } else {
      // Pause
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      speakNaturally("Taking a quick break. No problem!", 'reflection');
    }
    setIsPaused(!isPaused);
  }, [isPaused, handleTaskTimeUp]);

  // 🔄 Reset session
  const resetSession = useCallback(() => {
    setIsSessionActive(false);
    setIsPaused(false);
    setTimeRemaining(0);
    setPingCount(0);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    pingTimersRef.current.forEach(timer => clearTimeout(timer));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      pingTimersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercent = totalSessionTime > 0 
    ? ((totalSessionTime - timeRemaining) / totalSessionTime) * 100 
    : 0;

  const handleTaskComplete = (taskIndex: number) => {
    const newCompleted = new Set(completedTasks);
    newCompleted.add(taskIndex);
    setCompletedTasks(newCompleted);
    onTaskComplete?.(taskIndex);

    // Reset session for this task
    resetSession();

    // Trigger confetti for completed task
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });

    // Move to next task if available
    if (taskIndex < plan.length - 1) {
      setCurrentTaskIndex(taskIndex + 1);
      speakNaturally("Awesome! Task complete! Ready for the next one?", 'celebration');
    } else {
      speakNaturally("You did it! All tasks complete! You're a champion!", 'celebration');
    }
  };

  const getDifficultyStars = (difficulty: string) => {
    const count = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    return Array.from({ length: 3 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
      />
    ));
  };

  const allCompleted = completedTasks.size === plan.length;

  return (
    <div className="p-4 space-y-4">
      {/* 🔔 PING NOTIFICATION */}
      <AnimatePresence>
        {showPing && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <Bell className="w-6 h-6 animate-bounce" />
              <div>
                <div className="font-bold text-lg">{currentPingMessage}</div>
                <div className="text-sm opacity-90">Check-in #{pingCount} of 5</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⏱️ ACTIVE SESSION TIMER */}
      {isSessionActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 text-white shadow-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 animate-pulse" />
              <span className="font-bold">FOCUS MODE ACTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={togglePause}
                className="text-white hover:bg-white/20"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetSession}
                className="text-white hover:bg-white/20"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Timer Display */}
          <div className="text-center mb-3">
            <div className="text-5xl font-mono font-bold tracking-wider">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm opacity-80 mt-1">
              {isPaused ? '⏸️ PAUSED' : `Working on: ${plan[currentTaskIndex]?.task}`}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-white/30 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-white h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {/* Ping Counter */}
          <div className="flex justify-center gap-2 mt-3">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className={`w-3 h-3 rounded-full ${
                  num <= pingCount ? 'bg-yellow-400' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-purple-600 mb-2">📚 YOUR LEARNING QUEST</h2>
        <p className="text-sm text-muted-foreground">
          {plan.length} task{plan.length !== 1 ? 's' : ''} • {totalPlanTime} min total
        </p>
      </motion.div>

      {/* Tasks */}
      <div className="space-y-3">
        {plan.map((task, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`transition-all duration-300 ${
              completedTasks.has(index)
                ? 'bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-700'
                : isSessionActive && index === currentTaskIndex
                ? 'bg-purple-50 border-purple-400 dark:bg-purple-950 dark:border-purple-600 ring-2 ring-purple-400 shadow-lg'
                : 'hover:shadow-md'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {completedTasks.has(index) ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                      )}
                      <span className={`font-medium ${
                        completedTasks.has(index) ? 'line-through text-green-700' : ''
                      }`}>
                        {task.task}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {task.estimatedTime} min
                      </div>
                      <div className="flex items-center gap-1">
                        {getDifficultyStars(task.difficulty)}
                      </div>
                    </div>
                  </div>
                  {!completedTasks.has(index) && (
                    <Button
                      size="sm"
                      onClick={() => handleTaskComplete(index)}
                      className="ml-2"
                    >
                      ✓ Done
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Completion Message */}
      {allCompleted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center py-4"
        >
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-xl font-bold text-green-600 mb-2">QUEST COMPLETE!</h3>
          <p className="text-sm text-muted-foreground">You've leveled up your learning skills!</p>
        </motion.div>
      )}

      {/* Start Quest Button - ROCK N ROLL! */}
      {!allCompleted && !isSessionActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: plan.length * 0.1 + 0.5 }}
          className="text-center space-y-3"
        >
          <Button
            onClick={startSession}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
          >
            <Play className="w-6 h-6 mr-2" />
            🎸 ROCK N ROLL!
          </Button>
          <p className="text-sm text-muted-foreground">
            I'll check in with you 5 times during your study session!
          </p>
        </motion.div>
      )}
    </div>
  );
}