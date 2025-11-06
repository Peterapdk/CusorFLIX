import { prisma } from '@/lib/db';

/**
 * Get or create a demo user for development/testing
 * In production, this should be replaced with actual authentication
 */
export async function getOrCreateDemoUser() {
  try {
    let user = await prisma.user.findFirst({
      where: { email: 'demo@cinemarebel.local' },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@cinemarebel.local',
          name: 'Demo User',
        },
      });
    }

    return user.id;
  } catch (error) {
    console.error('Error getting/creating demo user:', error);
    return null;
  }
}

/**
 * Get user ID from session/auth
 * TODO: Replace with actual authentication logic
 */
export async function getUserId(): Promise<string | null> {
  // For now, use demo user
  // In production, get from session/auth context
  return getOrCreateDemoUser();
}

