export interface SessionFact {
  id: string;
  act: number;
  text: string;
  timestamp: string;
}

export interface SessionSummaryState {
  bulletPoints: string[];
  keyMilestones: string[];
}

export const DEFAULT_SESSION_SUMMARY: SessionSummaryState = {
  bulletPoints: [
    "The party ventured into the forgotten entrance of the Sunken Crypt.",
    "A sealed ironwood portcullis blocks the path into the lower ossuary.",
    "Ancient wards of the Silver Guard pulse faintly with necrotic corruption.",
  ],
  keyMilestones: [
    "Breached the outer threshold",
  ],
};

export function formatSessionSummaryPrompt(summary: SessionSummaryState = DEFAULT_SESSION_SUMMARY): string {
  if (!summary.bulletPoints.length) return "";
  return `Chronicle Facts & Prior Milestones:\n${summary.bulletPoints.map((b) => `• ${b}`).join("\n")}`;
}
