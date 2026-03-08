'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  taskId: string;
  disabled?: boolean;
  onSubmitted?: () => void;
}

export function ChatInput({ taskId, disabled, onSubmitted }: ChatInputProps) {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting || disabled) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/tasks/${taskId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: answer.trim() }),
      });

      if (res.ok) {
        setAnswer('');
        onSubmitted?.();
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Reply to agents..."
          disabled={disabled || isSubmitting}
          className="mc-input flex-1 !rounded-full !py-2 !px-4 text-sm"
          autoFocus
        />
        <button
          type="submit"
          disabled={!answer.trim() || disabled || isSubmitting}
          className="w-10 h-10 rounded-full bg-mc-accent text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4 ml-0.5" />
          )}
        </button>
      </form>
    </div>
  );
}
