/// <reference types="vite/client" />

// (optional) define your environment variables:
interface ImportMetaEnvironment {
  readonly VITE_API_URL?: string;
  // add your VITE_* here
}
interface ImportMeta {
  readonly env: ImportMetaEnvironment;
}
