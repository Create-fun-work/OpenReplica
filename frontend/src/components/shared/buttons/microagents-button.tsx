import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { BrainIcon } from "lucide-react";
import { TooltipButton } from "./tooltip-button";

export function MicroagentsButton() {
  const { t } = useTranslation();
  const location = useLocation();
  const isActive = location.pathname === "/microagents";

  return (
    <TooltipButton
      tooltip="Microagents"
      ariaLabel="Microagents"
      navLinkTo="/microagents"
      className={isActive ? "bg-primary/20" : ""}
    >
      <BrainIcon 
        className={`w-5 h-5 ${isActive ? "text-primary" : "text-basic hover:text-primary"}`} 
      />
    </TooltipButton>
  );
}
