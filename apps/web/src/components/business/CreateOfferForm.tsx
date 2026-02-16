"use client";

import { useState, useEffect, useRef } from "react";
import type { ProviderCapability } from "@/types/provider";
import * as api from "@/lib/api";
import { useWalletAddress } from "@/hooks/useWalletAddress";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type CapMode = "existing" | "new";
type PricingMode = "free" | "paid";
type TimeUnit = "min" | "hours" | "days";

const TIME_UNIT_LABELS: Record<TimeUnit, string> = {
  min: "Minutes",
  hours: "Hours",
  days: "Days",
};

const TIME_UNIT_TO_MINUTES: Record<TimeUnit, number> = {
  min: 1,
  hours: 60,
  days: 1440,
};

interface CreateOfferFormProps {
  onCreated?: () => void;
}

export function CreateOfferForm({ onCreated }: CreateOfferFormProps) {
  const walletAddress = useWalletAddress();
  const [businessName, setBusinessName] = useState("");
  const [capabilities, setCapabilities] = useState<ProviderCapability[]>([]);
  const [selectedCap, setSelectedCap] = useState<string | null>(null);
  const [capMode, setCapMode] = useState<CapMode>("existing");
  const [newCapName, setNewCapName] = useState("");
  const [newCapDesc, setNewCapDesc] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");
  const [pricingMode, setPricingMode] = useState<PricingMode>("free");
  const [price, setPrice] = useState(25);
  const [etaValue, setEtaValue] = useState(1);
  const [etaUnit, setEtaUnit] = useState<TimeUnit>("hours");
  const [unitOpen, setUnitOpen] = useState(false);
  const unitRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!unitOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (unitRef.current && !unitRef.current.contains(e.target as Node)) {
        setUnitOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [unitOpen]);

  useEffect(() => {
    api
      .fetchCapabilities()
      .then((data) =>
        setCapabilities(
          data.map((c) => ({ id: c.id, name: c.name, description: c.description }))
        )
      )
      .catch(() => {});
  }, []);

  const toggleCap = (id: string) => {
    setSelectedCap((prev) => (prev === id ? null : id));
  };

  const selectedCapability = capabilities.find((c) => c.id === selectedCap);

  const capValid =
    capMode === "existing"
      ? selectedCap !== null
      : newCapName.trim() !== "" && newCapDesc.trim() !== "";

  const formValid =
    businessName.trim() !== "" && walletAddress && capValid;

  const handleSubmit = async () => {
    if (!formValid) return;
    setBusy(true);
    setError(null);
    try {
      let capabilityId: string;
      let providerName: string;
      let providerDescription: string;

      if (capMode === "new") {
        const created = await api.createCapability({
          name: newCapName.trim(),
          description: newCapDesc.trim(),
        });
        capabilityId = created.id;
        providerName = newCapName.trim();
        providerDescription = newCapDesc.trim();
        setCapabilities((prev) => [
          ...prev,
          { id: created.id, name: created.name, description: created.description },
        ]);
      } else {
        capabilityId = selectedCap!;
        providerName = selectedCapability?.name ?? "";
        providerDescription = selectedCapability?.description ?? "";
      }

      await api.createProvider({
        name: providerName,
        businessName: businessName.trim(),
        description: providerDescription,
        aiInstructions: aiInstructions.trim(),
        walletAddress,
        capabilityIds: [capabilityId],
        price: pricingMode === "free" ? 0 : price,
        etaMinutes: etaValue * TIME_UNIT_TO_MINUTES[etaUnit],
      });

      setBusinessName("");
      setSelectedCap(null);
      setNewCapName("");
      setNewCapDesc("");
      setAiInstructions("");
      setPricingMode("free");
      setPrice(25);
      setEtaValue(1);
      setEtaUnit("hours");
      setCapMode("existing");
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create offer");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <h3 className="text-sm font-semibold text-text-primary mb-4">
        Create Offer
      </h3>
      <div className="flex flex-col gap-4">
        {/* Business Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">
            Business Name
          </label>
          <input
            type="text"
            placeholder="e.g. Joe's Restaurant"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="rounded-lg border border-border bg-surface-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent placeholder:text-text-muted"
          />
        </div>

        {/* Capability mode toggle — segmented control */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text-primary">
            Capability
          </span>
          <div className="flex rounded-lg bg-surface-raised/60 p-1 border border-border">
            <button
              type="button"
              onClick={() => setCapMode("existing")}
              className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-xs font-semibold tracking-wide transition-all duration-200 ${
                capMode === "existing"
                  ? "bg-accent/15 text-accent shadow-sm ring-1 ring-accent/25"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Choose Existing
            </button>
            <button
              type="button"
              onClick={() => setCapMode("new")}
              className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-xs font-semibold tracking-wide transition-all duration-200 ${
                capMode === "new"
                  ? "bg-accent/15 text-accent shadow-sm ring-1 ring-accent/25"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Create New
            </button>
          </div>
        </div>

        {/* Existing capability — single-select pills */}
        {capMode === "existing" && capabilities.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {capabilities.map((cap) => (
              <button
                key={cap.id}
                type="button"
                onClick={() => toggleCap(cap.id)}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                  selectedCap === cap.id
                    ? "border-accent bg-accent/8 text-accent"
                    : "border-border bg-surface-raised text-text-secondary hover:border-border-hover"
                }`}
              >
                {cap.name}
              </button>
            ))}
          </div>
        )}

        {capMode === "existing" && capabilities.length === 0 && (
          <p className="text-xs text-text-muted">
            No capabilities yet — switch to &quot;Create New&quot; to add one.
          </p>
        )}

        {/* New capability fields */}
        {capMode === "new" && (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Capability name"
              value={newCapName}
              onChange={(e) => setNewCapName(e.target.value)}
              className="rounded-lg border border-border bg-surface-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent placeholder:text-text-muted"
            />
            <textarea
              placeholder="Describe what this capability does..."
              value={newCapDesc}
              onChange={(e) => setNewCapDesc(e.target.value)}
              rows={2}
              className="rounded-lg border border-border bg-surface-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent placeholder:text-text-muted resize-none"
            />
          </div>
        )}

        {/* AI Instructions */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">
            Instructions for AI
          </label>
          <span className="text-[11px] text-text-muted leading-snug -mt-0.5">
            How should AI agents communicate or interact with your business?
          </span>
          <textarea
            placeholder="e.g. Always confirm availability before booking. Contact via email at hello@joes.com. Respond within 2 hours during business hours (9am-6pm EST)."
            value={aiInstructions}
            onChange={(e) => setAiInstructions(e.target.value)}
            rows={3}
            className="rounded-lg border border-border bg-surface-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent placeholder:text-text-muted resize-none"
          />
        </div>

        {/* Pricing toggle — segmented control */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text-primary">
            Pricing
          </span>
          <div className="flex rounded-lg bg-surface-raised/60 p-1 border border-border">
            <button
              type="button"
              onClick={() => setPricingMode("free")}
              className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-xs font-semibold tracking-wide transition-all duration-200 ${
                pricingMode === "free"
                  ? "bg-accent/15 text-accent shadow-sm ring-1 ring-accent/25"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Free
            </button>
            <button
              type="button"
              onClick={() => setPricingMode("paid")}
              className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-xs font-semibold tracking-wide transition-all duration-200 ${
                pricingMode === "paid"
                  ? "bg-accent/15 text-accent shadow-sm ring-1 ring-accent/25"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Paid
            </button>
          </div>
        </div>

        {/* Price + ETA row */}
        <div className="flex items-center gap-4">
          {pricingMode === "paid" && (
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-medium text-text-primary">
                Price
              </label>
              <div className="flex items-center rounded-lg border border-border bg-surface-base">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={price}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setPrice(Number.isNaN(v) ? 0 : Math.min(v, 10000));
                  }}
                  className="w-full bg-transparent px-2.5 py-1.5 text-sm font-medium text-text-primary outline-none font-mono"
                />
                <span className="border-l border-border px-2.5 py-1.5 text-xs text-text-muted font-medium">
                  MON
                </span>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-text-primary">
              Estimated Time
            </label>
            <div className="flex items-center rounded-lg border border-border bg-surface-base">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={etaValue}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  setEtaValue(Number.isNaN(v) ? 0 : v);
                }}
                className="w-full bg-transparent px-2.5 py-1.5 text-sm font-medium text-text-primary outline-none font-mono"
              />
              <div ref={unitRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUnitOpen((o) => !o)}
                  className="flex items-center gap-1 border-l border-border px-2.5 py-1.5 text-xs text-text-muted font-medium cursor-pointer hover:text-text-secondary transition-colors"
                >
                  {TIME_UNIT_LABELS[etaUnit]}
                  <svg
                    className={`h-3 w-3 transition-transform duration-150 ${unitOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {unitOpen && (
                  <div className="absolute right-0 bottom-full mb-1 z-10 min-w-[100px] rounded-lg border border-border bg-surface-overlay shadow-lg overflow-hidden">
                    {(Object.keys(TIME_UNIT_LABELS) as TimeUnit[]).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => {
                          setEtaUnit(unit);
                          setUnitOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                          etaUnit === unit
                            ? "bg-accent/12 text-accent"
                            : "text-text-secondary hover:bg-surface-highlight hover:text-text-primary"
                        }`}
                      >
                        {TIME_UNIT_LABELS[unit]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!formValid || busy}
        >
          {!walletAddress
            ? "Connect Wallet"
            : busy
              ? "Creating..."
              : "Create Offer"}
        </Button>
      </div>
    </Card>
  );
}
