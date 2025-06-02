import { useQuery } from "@tanstack/react-query";
import OpenReplica from "#/api/openreplica";
import { useIsAuthed } from "./use-is-authed";

export const useUserConversations = () => {
  const { data: userIsAuthenticated } = useIsAuthed();

  return useQuery({
    queryKey: ["user", "conversations"],
    queryFn: OpenReplica.getUserConversations,
    enabled: !!userIsAuthenticated,
  });
};
