import React from "react";
import { SessionsPage } from "#/components/features/sessions/sessions-page";

export default function SessionsRoute() {
  return (
    <div className="bg-base-secondary h-full flex flex-col rounded-xl overflow-hidden">
      <SessionsPage />
    </div>
  );
}
