import { prisma } from '@/lib/db';
import logger from '@/lib/logger';

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
    logger.error('Error getting/creating demo user', { context: 'Auth', error: error instanceof Error ? error : new Error(String(error)) });
    return null;
  }
}

/**
 * Get user ID from session/auth
 * 
 * NOTE: Currently uses demo authentication for development/testing.
 * This is intentional for the current development phase.
 * 
 * For production deployment, this should be replaced with:
 * - NextAuth.js or similar authentication library
 * - Session management via cookies/JWT
 * - User context from authentication middleware
 * 
 * @returns User ID string or null if authentication fails
 */
export async function getUserId(): Promise<string | null> {
  // For now, use demo user
  // In production, get from session/auth context
  return getOrCreateDemoUser();
}

