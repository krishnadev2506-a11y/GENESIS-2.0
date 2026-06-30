import React from 'react';
import { GlassCard } from './GlassCard';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <GlassCard className={`flex flex-col items-center justify-center text-center py-12 ${className}`}>
      {icon && (
        <div className="mb-4 text-accent-secondary opacity-80 bg-accent-primary/10 p-4 rounded-full">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-display font-semibold mb-2">{title}</h3>
      <p className="text-text-muted max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </GlassCard>
  );
}
