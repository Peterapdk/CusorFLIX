// Temporary JSX fallback types to satisfy editor linting in environments
// without installed React/Next type packages. Real types will be provided
// by Next.js toolchain during actual install/build.
// Note: This file may be redundant if @types/react is installed (check package.json)
declare namespace JSX {
  interface IntrinsicElements {
    // Use unknown instead of any for better type safety
    // Type guards should be used when accessing properties
    [elemName: string]: unknown;
  }
}


