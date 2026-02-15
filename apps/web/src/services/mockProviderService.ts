import type { Provider } from "@/types/provider";
import { PROVIDERS } from "@/data/providers";

const URGENT_MIN_STAKE = 150;

export async function getProviders(
  capability: string,
  urgent = false
): Promise<Provider[]> {
  await delay(300);
  let filtered = PROVIDERS.filter((p) => p.capabilities.includes(capability));
  if (urgent) {
    filtered = filtered.filter((p) => p.stakeAmount >= URGENT_MIN_STAKE);
  }
  return rankProviders(filtered);
}

export async function getProviderById(
  id: string
): Promise<Provider | undefined> {
  await delay(100);
  return PROVIDERS.find((p) => p.id === id);
}

function rankProviders(providers: Provider[]): Provider[] {
  return [...providers].sort((a, b) => {
    // Composite score: weighted by rating, success rate, and inverse price
    const scoreA = a.rating * 0.4 + a.successRate * 100 * 0.4 - a.price * 0.2;
    const scoreB = b.rating * 0.4 + b.successRate * 100 * 0.4 - b.price * 0.2;
    return scoreB - scoreA;
  });
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
