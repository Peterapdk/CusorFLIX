'use client';

import { useState, useTransition } from 'react';
import { createCustomListWithAuth } from '@/server/actions/lists';
import { useRouter } from 'next/navigation';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateListModal({ isOpen, onClose }: CreateListModalProps) {
  const [listName, setListName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!listName.trim()) {
      setError('List name is required');
      return;
    }

    startTransition(async () => {
      try {
        const result = await createCustomListWithAuth(listName.trim());
        if (result.error) {
          setError(result.error);
        } else {
          setListName('');
          onClose();
          router.refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create list');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Create New List</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="listName" className="block text-sm font-medium text-foreground mb-2">
              List Name
            </label>
            <input
              id="listName"
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="My Favorite Movies"
              className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isPending}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !listName.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Creating...' : 'Create List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

