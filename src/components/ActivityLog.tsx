/**
 * ActivityLog Component
 * Displays chronological activity log for a task
 */

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { TaskActivity } from '@/lib/types';

interface ActivityLogProps {
  taskId: string;
}

export function ActivityLog({ taskId }: ActivityLogProps) {
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastCountRef = useRef(0);

  const loadActivities = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);

      const res = await fetch(`/api/tasks/${taskId}/activities`);
      const data = await res.json();

      if (res.ok) {
        setActivities(data);
        lastCountRef.current = data.length;
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  // Initial load
  useEffect(() => {
    loadActivities(true);
  }, [taskId, loadActivities]);

  // Polling function
  const pollForActivities = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/activities`);
      if (res.ok) {
        const data = await res.json();
        // Only update if there are new activities
        if (data.length !== lastCountRef.current) {
          setActivities(data);
          lastCountRef.current = data.length;
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, [taskId]); // setActivities is stable from React, no need to include

  // Poll for new activities every 5 seconds when task is in progress
  useEffect(() => {
    const pollInterval = setInterval(pollForActivities, 5000);

    pollingRef.current = pollInterval;

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [taskId, pollForActivities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'spawned':
        return '🚀';
      case 'updated':
        return '✏️';
      case 'completed':
        return '✅';
      case 'file_created':
        return '📄';
      case 'status_changed':
        return '🔄';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-mc-text-secondary">Loading activities...</div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-mc-text-secondary">
        <div className="text-4xl mb-2">📝</div>
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex gap-4 p-4 mc-card !rounded-[1.5rem] !shadow-sm hover:!translate-y-0 hover:!scale-[1.01] transition-all"
        >
          {/* Icon */}
          <div className="icon-box !w-10 !h-10 !rounded-xl text-xl flex-shrink-0 bg-mc-bg-tertiary">
            {getActivityIcon(activity.activity_type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Agent info */}
            {activity.agent && (
              <div className="flex items-center gap-2 mb-2">
                <div className="px-2 py-0.5 bg-mc-bg-tertiary rounded-lg border border-mc-border/20 flex items-center gap-2">
                  <span className="text-xs">{activity.agent.avatar_emoji}</span>
                  <span className="text-xs font-bold text-mc-accent uppercase tracking-wider">
                    {activity.agent.name}
                  </span>
                </div>
              </div>
            )}

            {/* Message */}
            <p className="text-sm font-medium text-mc-text leading-relaxed">
              {activity.message}
            </p>

            {/* Metadata */}
            {activity.metadata && (
              <div className="mt-3 p-3 bg-mc-bg/50 backdrop-blur-sm rounded-xl text-xs text-mc-text-secondary font-mono border border-mc-border/10 overflow-x-auto">
                <pre className="whitespace-pre-wrap">
                  {typeof activity.metadata === 'string' 
                    ? activity.metadata 
                    : JSON.stringify(JSON.parse(activity.metadata), null, 2)}
                </pre>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-[10px] font-bold uppercase tracking-widest text-mc-text-secondary mt-3 opacity-60">
              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
