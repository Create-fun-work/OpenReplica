import { OpenReplicaAction } from "#/types/core/actions";
import { OpenReplicaObservation } from "#/types/core/observations";

export const MAX_CONTENT_LENGTH = 1000;

export const getDefaultEventContent = (
  event: OpenReplicaAction | OpenReplicaObservation,
): string => `\`\`\`json\n${JSON.stringify(event, null, 2)}\n\`\`\``;
