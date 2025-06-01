import { useMutation } from "@tanstack/react-query";
import OpenReplica from "#/api/openreplica";

export const useGetTrajectory = () =>
  useMutation({
    mutationFn: (cid: string) => OpenReplica.getTrajectory(cid),
  });
