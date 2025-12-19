import { motion } from 'framer-motion';
import { CheckCircle, Clock, Star, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';
import { useState } from 'react';

interface PlanTask {
  task: string;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed?: boolean;
}

interface ControllerPlanDisplayProps {
  plan: PlanTask[];
  onStartQuest?: () => void;
  onTaskComplete?: (taskIndex: number) => void;
}

export function ControllerPlanDisplay({ plan, onStartQuest, onTaskComplete }: ControllerPlanDisplayProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());

  const handleTaskComplete = (taskIndex: number) => {
    const newCompleted = new Set(completedTasks);
    newCompleted.add(taskIndex);
    setCompletedTasks(newCompleted);
    onTaskComplete?.(taskIndex);

    // Trigger confetti for completed task
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-purple-600 mb-2">📚 YOUR LEARNING QUEST</h2>
        <p className="text-sm text-muted-foreground">Complete these tasks to level up!</p>
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

      {/* Start Quest Button */}
      {!allCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: plan.length * 0.1 + 0.5 }}
          className="text-center"
        >
          <Button
            onClick={onStartQuest}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Play className="w-5 h-5 mr-2" />
            START QUEST
          </Button>
        </motion.div>
      )}
    </div>
  );
}