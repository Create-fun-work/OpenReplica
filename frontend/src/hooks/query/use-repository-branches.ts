import { useQuery } from "@tanstack/react-query";
import OpenReplica from "#/api/openreplica";
import { Branch } from "#/types/git";

export const useRepositoryBranches = (repository: string | null) =>
  useQuery<Branch[]>({
    queryKey: ["repository", repository, "branches"],
    queryFn: async () => {
      if (!repository) return [];
      return OpenReplica.getRepositoryBranches(repository);
    },
    enabled: !!repository,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
