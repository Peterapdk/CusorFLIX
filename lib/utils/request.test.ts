import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getClientIp } from './request';

describe('getClientIp', () => {
  it('should return IP from x-forwarded-for header', () => {
    const headers = new Headers();
    headers.set('x-forwarded-for', '192.168.1.1, 10.0.0.1');
    
    const request = new NextRequest('http://localhost:3000', {
      headers,
    });
    
    expect(getClientIp(request)).toBe('192.168.1.1');
  });

  it('should return IP from x-real-ip header when x-forwarded-for is not present', () => {
    const headers = new Headers();
    headers.set('x-real-ip', '192.168.1.2');
    
    const request = new NextRequest('http://localhost:3000', {
      headers,
    });
    
    expect(getClientIp(request)).toBe('192.168.1.2');
  });

  it('should return IP from cf-connecting-ip header when others are not present', () => {
    const headers = new Headers();
    headers.set('cf-connecting-ip', '192.168.1.3');
    
    const request = new NextRequest('http://localhost:3000', {
      headers,
    });
    
    expect(getClientIp(request)).toBe('192.168.1.3');
  });

  it('should prioritize x-forwarded-for over other headers', () => {
    const headers = new Headers();
    headers.set('x-forwarded-for', '192.168.1.1');
    headers.set('x-real-ip', '192.168.1.2');
    headers.set('cf-connecting-ip', '192.168.1.3');
    
    const request = new NextRequest('http://localhost:3000', {
      headers,
    });
    
    expect(getClientIp(request)).toBe('192.168.1.1');
  });

  it('should return "unknown" when no IP headers are present', () => {
    const headers = new Headers();
    const request = new NextRequest('http://localhost:3000', {
      headers,
    });
    
    expect(getClientIp(request)).toBe('unknown');
  });

  it('should handle x-forwarded-for with multiple IPs and whitespace', () => {
    const headers = new Headers();
    headers.set('x-forwarded-for', '  192.168.1.1  ,  10.0.0.1  ,  172.16.0.1  ');
    
    const request = new NextRequest('http://localhost:3000', {
      headers,
    });
    
    expect(getClientIp(request)).toBe('192.168.1.1');
  });

  it('should trim whitespace from IP addresses', () => {
    const headers = new Headers();
    headers.set('x-real-ip', '  192.168.1.1  ');
    
    const request = new NextRequest('http://localhost:3000', {
      headers,
    });
    
    expect(getClientIp(request)).toBe('192.168.1.1');
  });
});

