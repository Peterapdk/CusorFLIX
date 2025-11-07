'use client';

import { useState, useTransition } from 'react';
import { updateListName, deleteList } from '@/server/actions/lists';
import { useRouter } from 'next/navigation';

interface ListActionsProps {
  listId: string;
  listName: string;
  listType: 'watchlist' | 'custom';
}

export default function ListActions({ listId, listName, listType }: ListActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(listName);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Watchlist cannot be edited or deleted
  if (listType === 'watchlist') return null;

  const handleUpdate = () => {
    if (!editName.trim()) {
      setError('List name is required');
      return;
    }

    if (editName.trim() === listName) {
      setIsEditing(false);
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await updateListName(listId, editName.trim());
        setIsEditing(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update list name');
      }
    });
  };

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        await deleteList(listId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete list');
        setIsDeleting(false);
      }
    });
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleUpdate();
            if (e.key === 'Escape') {
              setEditName(listName);
              setIsEditing(false);
              setError(null);
            }
          }}
          className="bg-input border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isPending}
          autoFocus
        />
        <button
          onClick={handleUpdate}
          disabled={isPending}
          className="px-2 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          Save
        </button>
        <button
          onClick={() => {
            setEditName(listName);
            setIsEditing(false);
            setError(null);
          }}
          disabled={isPending}
          className="px-2 py-1 text-sm text-foreground hover:bg-secondary rounded transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setIsEditing(true)}
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
        title="Edit list name"
        aria-label="Edit list name"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        onClick={() => setIsDeleting(true)}
        className="p-2 text-muted-foreground hover:text-destructive hover:bg-secondary rounded transition-colors"
        title="Delete list"
        aria-label="Delete list"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setIsDeleting(false)}>
          <div className="bg-card border border-border rounded-lg p-4 shadow-lg max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-foreground mb-3">Delete &quot;{listName}&quot;? This action cannot be undone.</p>
            <div className="flex space-x-2">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => {
                  setIsDeleting(false);
                  setError(null);
                }}
                disabled={isPending}
                className="px-3 py-1 text-sm text-foreground hover:bg-secondary rounded transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

