/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TASK_ANALYZER_URL?: string;
  readonly VITE_PROJECT_PLANNER_URL?: string;
  readonly VITE_GMAIL_SYNC_URL?: string;
  readonly VITE_GMAIL_DRAFT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
