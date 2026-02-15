"use client";

import { OffersList } from "@/components/business/OffersList";
import { IncomingRequests } from "@/components/business/IncomingRequests";

export function BusinessPanel() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OffersList />
        <IncomingRequests />
      </div>
    </section>
  );
}
