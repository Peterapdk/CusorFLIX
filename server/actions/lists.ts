'use server';

import { prisma } from '@/lib/db';
import type { MediaType } from '@/lib/tmdb';

export async function createCustomList(userId: string, name: string) {
  return prisma.list.create({ data: { userId, name, type: 'custom' } });
}

export async function addToList(params: { listId: string; mediaType: MediaType; tmdbId: number }) {
  const { listId, mediaType, tmdbId } = params;
  return prisma.listItem.upsert({
    where: { listId_tmdbId: { listId, tmdbId } },
    create: { listId, mediaType, tmdbId },
    update: { mediaType },
  });
}

export async function removeFromList(itemId: string) {
  await prisma.listItem.delete({ where: { id: itemId } });
  return { ok: true } as const;
}

export async function toggleWatchlist(userId: string, mediaType: MediaType, tmdbId: number) {
  let list = await prisma.list.findFirst({ where: { userId, type: 'watchlist' } });
  if (!list) list = await prisma.list.create({ data: { userId, name: 'Watchlist', type: 'watchlist' } });

  const existing = await prisma.listItem.findFirst({ where: { listId: list.id, tmdbId } });
  if (existing) {
    await prisma.listItem.delete({ where: { id: existing.id } });
    return { inWatchlist: false } as const;
  }
  await prisma.listItem.create({ data: { listId: list.id, mediaType, tmdbId } });
  return { inWatchlist: true } as const;
}


