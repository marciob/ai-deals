"use client";

import { useState, useCallback } from "react";
import { OffersList } from "@/components/business/OffersList";
import { CreateOfferForm } from "@/components/business/CreateOfferForm";
import { IncomingRequests } from "@/components/business/IncomingRequests";

export function BusinessPanel() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOfferCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <section className="w-full max-w-5xl mx-auto px-4 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OffersList key={refreshKey} />
        <div className="flex flex-col gap-6">
          <CreateOfferForm onCreated={handleOfferCreated} />
          <IncomingRequests />
        </div>
      </div>
    </section>
  );
}
