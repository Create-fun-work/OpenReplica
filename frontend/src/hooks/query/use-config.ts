import { useQuery } from "@tanstack/react-query";
import OpenReplica from "#/api/openreplica";
import { useIsOnTosPage } from "#/hooks/use-is-on-tos-page";

export const useConfig = () => {
  const isOnTosPage = useIsOnTosPage();

  return useQuery({
    queryKey: ["config"],
    queryFn: OpenReplica.getConfig,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes,
    enabled: !isOnTosPage,
  });
};
