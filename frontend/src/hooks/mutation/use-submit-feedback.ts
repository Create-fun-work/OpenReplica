import { useMutation } from "@tanstack/react-query";
import { Feedback } from "#/api/openreplica.types";
import OpenReplica from "#/api/openreplica";
import { useConversationId } from "#/hooks/use-conversation-id";
import { displayErrorToast } from "#/utils/custom-toast-handlers";

type SubmitFeedbackArgs = {
  feedback: Feedback;
};

export const useSubmitFeedback = () => {
  const { conversationId } = useConversationId();
  return useMutation({
    mutationFn: ({ feedback }: SubmitFeedbackArgs) =>
      OpenReplica.submitFeedback(conversationId, feedback),
    onError: (error) => {
      displayErrorToast(error.message);
    },
    retry: 2,
    retryDelay: 500,
  });
};
