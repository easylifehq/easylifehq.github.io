export interface AiCommand {
  title: string;
  source: string;
  status: string;
  response: string;
  preview: string;
}

export interface AiSuggestion {
  prompt: string;
  title: string;
  response: string;
  actions: string[];
}

export interface AiBrief {
  dateLabel: string;
  headline: string;
  whatMatters: string[];
  sections: Array<{
    title: string;
    items: string[];
  }>;
  warnings: string[];
}

export interface AiContextSnapshot {
  capturedAtLabel: string;
  signals: Array<{
    label: string;
    value: string;
  }>;
}

export interface AiMockProvider {
  name: string;
  context: AiContextSnapshot;
  commands: AiCommand[];
  suggestions: AiSuggestion[];
  brief: AiBrief;
  runCommand: (prompt: string) => AiSuggestion;
}
