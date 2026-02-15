export type AppMode = "agent" | "human" | "business";

export interface ModeContent {
  mode: AppMode;
  headline: string;
  subtitle: string;
  cta: string;
}
