export interface ProviderCapability {
  id: string;
  name: string;
  description: string;
}

export interface Provider {
  id: string;
  name: string;
  businessName: string;
  description: string;
  aiInstructions: string;
  capabilities: string[];
  price: number;
  currency: string;
  etaMinutes: number;
  rating: number;
  stakeAmount: number;
  successRate: number;
  address: string;
}
