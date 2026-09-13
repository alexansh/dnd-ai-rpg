export interface AuthorNote {
  text: string;
  tone: string;
  pacing: string;
  active: boolean;
}

export const DEFAULT_AUTHOR_NOTE: AuthorNote = {
  text: "Tone: grim, low-fantasy dark dungeon crawler. Pacing: maintain suspense and escalate tension toward ancient horrors.",
  tone: "Grim Dark Fantasy",
  pacing: "Suspenseful & Deliberate",
  active: true,
};

export function formatAuthorNotePrompt(note: AuthorNote = DEFAULT_AUTHOR_NOTE): string {
  if (!note.active || !note.text.trim()) return "";
  return `[Author's Note / Tone Directive: ${note.text.trim()}]`;
}
