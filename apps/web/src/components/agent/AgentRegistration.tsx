"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CopyCommand } from "@/components/agent/CopyCommand";
import { useWalletAddress } from "@/hooks/useWalletAddress";
import * as api from "@/lib/api";

interface RegistrationResult {
  id: string;
  apiKey: string;
  agentName: string;
  claimUrl: string;
  claimed: boolean;
}

export function AgentRegistration() {
  const address = useWalletAddress();
  const [agentName, setAgentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RegistrationResult | null>(null);

  const handleRegister = useCallback(async () => {
    if (!agentName.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const reg = await api.registerAgent(agentName.trim());
      let claimed = false;

      // Auto-claim if wallet is connected
      if (address) {
        try {
          await api.claimAgent(reg.apiKey, address);
          claimed = true;
        } catch {
          // Claim failed — agent still registered, user can claim manually
        }
      }

      setResult({ ...reg, claimed });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }, [agentName, address]);

  if (result) {
    return (
      <Card className="max-w-xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-status-verified" />
            <h3 className="text-sm font-semibold text-text-primary">
              Agent Registered
            </h3>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-text-muted">
              Agent Name
            </span>
            <span className="text-sm text-text-primary">
              {result.agentName}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-muted">
              API Key
            </span>
            <CopyCommand command={result.apiKey} />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-muted">
              Claim URL
            </span>
            <CopyCommand command={result.claimUrl} />
          </div>

          {result.claimed && address && (
            <p className="text-xs text-status-verified">
              Auto-claimed to {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}

          {!result.claimed && !address && (
            <p className="text-xs text-text-muted">
              Connect your wallet to claim this agent to your address.
            </p>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setResult(null);
              setAgentName("");
            }}
          >
            Register Another
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-semibold text-text-primary">
            Register Agent
          </h3>
          <p className="text-xs text-text-muted">
            Register your agent to get an API key for the ai-deals protocol.
          </p>
        </div>

        <Input
          label="Agent Name"
          placeholder="my-trading-agent"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRegister();
          }}
        />

        {error && (
          <p className="text-xs text-status-timed-out">{error}</p>
        )}

        <Button
          onClick={handleRegister}
          disabled={!agentName.trim() || loading}
        >
          {loading ? "Registering..." : "Register"}
        </Button>

        {address && (
          <p className="text-xs text-text-muted">
            Will auto-claim to {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        )}
      </div>
    </Card>
  );
}
