import { useQuery } from "@tanstack/react-query";
import OpenReplica from "#/api/openreplica";

const fetchAiConfigOptions = async () => ({
  models: await OpenReplica.getModels(),
  agents: await OpenReplica.getAgents(),
  securityAnalyzers: await OpenReplica.getSecurityAnalyzers(),
});

export const useAIConfigOptions = () =>
  useQuery({
    queryKey: ["ai-config-options"],
    queryFn: fetchAiConfigOptions,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
