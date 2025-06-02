import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { MessageSquareIcon } from "lucide-react";
import { TooltipButton } from "./tooltip-button";

export function SessionsButton() {
  const { t } = useTranslation();
  const location = useLocation();
  const isActive = location.pathname === "/sessions";

  return (
    <TooltipButton
      tooltip="AI Sessions"
      ariaLabel="AI Sessions"
      navLinkTo="/sessions"
      className={isActive ? "bg-primary/20" : ""}
    >
      <MessageSquareIcon 
        className={`w-5 h-5 ${isActive ? "text-primary" : "text-basic hover:text-primary"}`} 
      />
    </TooltipButton>
  );
}
