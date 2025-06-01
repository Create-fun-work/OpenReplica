import { useTranslation } from "react-i18next";
import { OpenReplicaLogoSpark } from "#/assets/branding/openreplica-logo-spark";
import { I18nKey } from "#/i18n/declaration";
import { TooltipButton } from "./tooltip-button";

export function OpenReplicaLogoButton() {
  const { t } = useTranslation();

  return (
    <TooltipButton
      tooltip="OpenReplica"
      ariaLabel="OpenReplica Logo"
      navLinkTo="/"
    >
      <OpenReplicaLogoSpark width={34} height={34} />
    </TooltipButton>
  );
}
