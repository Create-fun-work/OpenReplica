import { useMutation } from "@tanstack/react-query";
import OpenReplica from "#/api/openreplica";

export const useCreateStripeCheckoutSession = () =>
  useMutation({
    mutationFn: async (variables: { amount: number }) => {
      const redirectUrl = await OpenReplica.createCheckoutSession(
        variables.amount,
      );
      window.location.href = redirectUrl;
    },
  });
