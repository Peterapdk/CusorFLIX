/**
 * Environment initialization
 * 
 * This module validates environment variables when imported.
 * It's imported in app/layout.tsx to ensure validation happens early.
 * 
 * The validation is lazy - it happens when getEnvConfig() is first called,
 * which provides better error messages and prevents issues during build time.
 */

// Import env module to trigger validation when getEnvConfig() is first called
// This happens when lib/tmdb.ts or lib/db.ts are imported, which happens early
// in the application lifecycle via app/layout.tsx
import './env';

// Re-export for convenience
export { getEnvConfig, validateEnv, type EnvConfig, EnvValidationError } from './env';

