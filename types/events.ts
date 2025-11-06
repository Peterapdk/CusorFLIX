/**
 * Custom Event Type Definitions
 */

export interface AdBlockerBlockedEventDetail {
  url: string;
  reason: 'popup' | 'suspicious-origin' | 'ad-message' | 'redirect';
}

export interface AdBlockerBlockedEvent extends CustomEvent {
  detail: AdBlockerBlockedEventDetail;
}

declare global {
  interface WindowEventMap {
    'adblocker:blocked': AdBlockerBlockedEvent;
  }
}

