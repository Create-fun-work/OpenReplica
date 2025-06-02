import React from "react";
import { MicroagentsPage } from "#/components/features/microagents/microagents-page";

export default function MicroagentsRoute() {
  return (
    <div className="bg-base-secondary h-full flex flex-col rounded-xl overflow-hidden">
      <MicroagentsPage />
    </div>
  );
}
