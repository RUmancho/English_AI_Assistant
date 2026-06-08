"use client";

import { ChatPanel } from "@/components/ChatPanel";
import { ErrorAnalytics } from "@/components/ErrorAnalytics";

export function Dashboard() {
  return (
    <div className="flex h-screen flex-col lg:flex-row">
      <section className="flex h-[60vh] flex-col lg:h-full lg:w-[75%]">
        <ChatPanel />
      </section>
      <section className="h-[40vh] lg:h-full lg:w-[25%]">
        <ErrorAnalytics />
      </section>
    </div>
  );
}
