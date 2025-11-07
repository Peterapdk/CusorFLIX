'use server';

import { prisma } from '@/lib/db';
import logger from '@/lib/logger';

type MediaType = 'movie' | 'tv'; // Prisma MediaType enum

export async function createCustomList(userId: string, name: string) {
  try {
    return await prisma.list.create({ data: { userId, name, type: 'custom' } });
  } catch (error) {
    logger.error('Error creating custom list', { context: 'ServerActions', error: error instanceof Error ? error : new Error(String(error)) });
    throw new Error('Failed to create custom list');
  }
}

export async function addToList(params: { listId: string; mediaType: MediaType; tmdbId: number }) {
  try {
    const { listId, mediaType, tmdbId } = params;
    return await prisma.listItem.upsert({
      where: { listId_tmdbId_mediaType: { listId, tmdbId, mediaType } },
      create: { listId, mediaType, tmdbId },
      update: {},
    });
  } catch (error) {
    logger.error('Error adding item to list', { context: 'ServerActions', error: error instanceof Error ? error : new Error(String(error)) });
    throw new Error('Failed to add item to list');
  }
}

export async function removeFromList(itemId: string) {
  try {
    await prisma.listItem.delete({ where: { id: itemId } });
    return { ok: true } as const;
  } catch (error) {
    logger.error('Error removing item from list', { context: 'ServerActions', error: error instanceof Error ? error : new Error(String(error)) });
    throw new Error('Failed to remove item from list');
  }
}

export async function toggleWatchlist(userId: string, mediaType: MediaType, tmdbId: number) {
  try {
    let list = await prisma.list.findFirst({ where: { userId, type: 'watchlist' } });
    if (!list) {
      list = await prisma.list.create({ data: { userId, name: 'Watchlist', type: 'watchlist' } });
    }

    const existing = await prisma.listItem.findFirst({ where: { listId: list.id, tmdbId, mediaType } });
    if (existing) {
      await prisma.listItem.delete({ where: { id: existing.id } });
      return { inWatchlist: false } as const;
    }
    await prisma.listItem.create({ data: { listId: list.id, mediaType, tmdbId } });
    return { inWatchlist: true } as const;
  } catch (error) {
    logger.error('Error toggling watchlist', { context: 'ServerActions', error: error instanceof Error ? error : new Error(String(error)) });
    throw new Error('Failed to toggle watchlist');
  }
}

export async function toggleWatchlistWithAuth(mediaType: MediaType, tmdbId: number) {
  try {
    const { getOrCreateDemoUser } = await import('@/lib/auth');
    const userId = await getOrCreateDemoUser();
    if (!userId) {
      return { error: 'Please log in to manage your watchlist', inWatchlist: null } as const;
    }
    const result = await toggleWatchlist(userId, mediaType, tmdbId);
    return result;
  } catch (error) {
    logger.error('Error toggling watchlist with auth', { context: 'ServerActions', error: error instanceof Error ? error : new Error(String(error)) });
    return { error: 'Failed to update watchlist', inWatchlist: null } as const;
  }
}

export async function updateListName(listId: string, name: string) {
  try {
    await prisma.list.update({
      where: { id: listId },
      data: { name },
    });
    return { ok: true } as const;
  } catch (error) {
    logger.error('Error updating list name', { context: 'ServerActions', error: error instanceof Error ? error : new Error(String(error)) });
    throw new Error('Failed to update list name');
  }
}

export async function deleteList(listId: string) {
  try {
    await prisma.list.delete({ where: { id: listId } });
    return { ok: true } as const;
  } catch (error) {
    logger.error('Error deleting list', { context: 'ServerActions', error: error instanceof Error ? error : new Error(String(error)) });
    throw new Error('Failed to delete list');
  }
}

export async function createCustomListWithAuth(name: string) {
  try {
    const { getOrCreateDemoUser } = await import('@/lib/auth');
    const userId = await getOrCreateDemoUser();
    if (!userId) {
      return { error: 'Please log in to create lists', list: null } as const;
    }
    const list = await createCustomList(userId, name);
    return { list } as const;
  } catch (error) {
    logger.error('Error creating custom list with auth', { context: 'ServerActions', error: error instanceof Error ? error : new Error(String(error)) });
    return { error: 'Failed to create list', list: null } as const;
  }
}