'use client';

import { useState } from 'react';
import Link from 'next/link';
import MediaCardWithRemove from '@/components/ui/MediaCardWithRemove';
import CreateListModal from '@/components/ui/CreateListModal';
import ListActions from '@/components/ui/ListActions';
import type { EnrichedLibraryItem } from '@/types/library';

type CustomList = {
  id: string;
  name: string;
  type: 'custom';
  items: Array<{ id: string; mediaType: string; tmdbId: number }>;
  enrichedItems: EnrichedLibraryItem[];
};

interface CustomListsSectionProps {
  lists: CustomList[];
}

export default function CustomListsSection({ lists }: CustomListsSectionProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (lists.length === 0) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Custom Lists</h2>
            <p className="text-muted-foreground">Create collections to organize your content</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            + Create List
          </button>
        </div>
        
        <CreateListModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

        <div className="text-center py-16">
          <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No custom lists yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Create custom lists to organize your favorite movies and TV shows into collections!
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Create Your First List
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Custom Lists</h2>
          <p className="text-muted-foreground">{lists.length} {lists.length === 1 ? 'list' : 'lists'}</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          + Create List
        </button>
      </div>

      <CreateListModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      <div className="space-y-12">
        {lists.map((list) => (
          <div key={list.id} className="space-y-6">
            {/* List Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{list.name}</h3>
                <p className="text-muted-foreground">{list.enrichedItems.length} {list.enrichedItems.length === 1 ? 'item' : 'items'}</p>
              </div>
              <ListActions listId={list.id} listName={list.name} listType="custom" />
            </div>

            {/* List Content */}
            {list.enrichedItems.length === 0 ? (
              <div className="text-center py-8 border border-border rounded-lg">
                <p className="text-muted-foreground">No items in this list</p>
                <Link
                  href="/discovery"
                  className="mt-4 inline-block px-4 py-2 text-sm text-primary hover:underline"
                >
                  Browse content to add items
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {list.enrichedItems.map((item) => (
                  <MediaCardWithRemove
                    key={`${item.media_type}-${item.id}-${item.listItemId}`}
                    item={item}
                    listItemId={item.listItemId}
                    size="medium"
                    inWatchlist={false}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
