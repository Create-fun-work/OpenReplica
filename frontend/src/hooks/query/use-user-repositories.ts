import { useQuery } from "@tanstack/react-query";
import OpenReplica from "#/api/openreplica";

export const useUserRepositories = () =>
  useQuery({
    queryKey: ["repositories"],
    queryFn: OpenReplica.retrieveUserGitRepositories,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
