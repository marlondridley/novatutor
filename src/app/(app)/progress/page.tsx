/**
 * Student Progress Dashboard
 * Shows executive function analytics and growth metrics
 */

import { ExecutiveFunctionDashboard } from '@/components/executive-function-dashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Progress | NovaTutor',
  description: 'Track your executive function progress, focus, tasks, and goals',
};

export default function ProgressPage() {
  return (
    <div className="container mx-auto py-6">
      <ExecutiveFunctionDashboard />
    </div>
  );
}

