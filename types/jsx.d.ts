// Temporary JSX fallback types to satisfy editor linting in environments
// without installed React/Next type packages. Real types will be provided
// by Next.js toolchain during actual install/build.
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}


