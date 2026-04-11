/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TASK_ANALYZER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
