/**
 * 🎂 Age-Based UI Optimizations
 * 
 * Different age groups need different UI adjustments:
 * - Younger kids: Larger, brighter, slower
 * - Teens: Smaller, subdued, faster
 */

import { GradeLevel } from '@/ai/behavior-control';

export interface AgeOptimization {
  // Visual
  iconSize: 'sm' | 'md' | 'lg' | 'xl';
  fontSize: number; // in px
  colorSaturation: 'low' | 'medium' | 'high';
  borderWidth: number; // in px
  
  // Animation
  animationSpeed: 'slow' | 'normal' | 'fast';
  animationDuration: number; // in ms
  
  // Audio
  audioVolume: number; // 0-1
  audioEnabled: boolean;
  
  // Interaction
  touchTargetSize: number; // min size in px
  tooltipsEnabled: boolean;
  helpPromptsFrequency: 'high' | 'medium' | 'low';
}

/**
 * Get age-appropriate optimizations based on grade level
 */
export function getAgeOptimizations(gradeLevel: GradeLevel): AgeOptimization {
  // Elementary (Grades 3-5): Ages 8-10
  if (gradeLevel >= 3 && gradeLevel <= 5) {
    return {
      iconSize: 'xl',
      fontSize: 18,
      colorSaturation: 'high',
      borderWidth: 3,
      animationSpeed: 'slow',
      animationDuration: 300,
      audioVolume: 0.8,
      audioEnabled: true,
      touchTargetSize: 48,
      tooltipsEnabled: true,
      helpPromptsFrequency: 'high',
    };
  }
  
  // Middle School (Grades 6-8): Ages 11-13
  if (gradeLevel >= 6 && gradeLevel <= 8) {
    return {
      iconSize: 'lg',
      fontSize: 16,
      colorSaturation: 'medium',
      borderWidth: 2,
      animationSpeed: 'normal',
      animationDuration: 200,
      audioVolume: 0.9,
      audioEnabled: true,
      touchTargetSize: 44,
      tooltipsEnabled: true,
      helpPromptsFrequency: 'medium',
    };
  }
  
  // High School (Grades 9-12): Ages 14-18
  return {
    iconSize: 'md',
    fontSize: 15,
    colorSaturation: 'low',
    borderWidth: 2,
    animationSpeed: 'fast',
    animationDuration: 150,
    audioVolume: 1.0,
    audioEnabled: false, // Teens prefer silence
    touchTargetSize: 40,
    tooltipsEnabled: false,
    helpPromptsFrequency: 'low',
  };
}

/**
 * Apply age optimizations to component styles
 */
export function applyAgeStyles(optimization: AgeOptimization) {
  const iconSizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };
  
  return {
    iconClass: iconSizeMap[optimization.iconSize],
    fontSize: `${optimization.fontSize}px`,
    minTouchTarget: `${optimization.touchTargetSize}px`,
    animationDuration: `${optimization.animationDuration}ms`,
    borderWidth: `${optimization.borderWidth}px`,
  };
}

