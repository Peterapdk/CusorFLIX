import type { NextRequest } from 'next/server';

/**
 * Extract client IP address from request headers
 * Prioritizes headers in order: x-forwarded-for, x-real-ip, cf-connecting-ip
 */
export function getClientIp(request: NextRequest): string {
  // Check x-forwarded-for header (most common with proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs separated by commas
    // The first IP is typically the original client IP
    const ips = forwardedFor.split(',').map((ip: string) => ip.trim());
    return ips[0];
  }

  // Check x-real-ip header (used by some proxies like nginx)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Check cf-connecting-ip header (Cloudflare)
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Fallback to unknown if no IP headers found
  return 'unknown';
}