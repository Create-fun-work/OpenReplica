import { useQuery } from "@tanstack/react-query";
import OpenReplica from "#/api/openreplica";

export function useSearchRepositories(query: string) {
  return useQuery({
    queryKey: ["repositories", query],
    queryFn: () => OpenReplica.searchGitRepositories(query, 3),
    enabled: !!query,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}
