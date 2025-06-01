import { OpenReplicaAction } from "#/types/core/actions";
import { OpenReplicaEventType } from "#/types/core/base";
import {
  isCommandAction,
  isCommandObservation,
  isOpenReplicaAction,
  isOpenReplicaObservation,
} from "#/types/core/guards";
import { OpenReplicaObservation } from "#/types/core/observations";

const COMMON_NO_RENDER_LIST: OpenReplicaEventType[] = [
  "system",
  "agent_state_changed",
  "change_agent_state",
];

const ACTION_NO_RENDER_LIST: OpenReplicaEventType[] = ["recall"];

export const shouldRenderEvent = (
  event: OpenReplicaAction | OpenReplicaObservation,
) => {
  if (isOpenReplicaAction(event)) {
    if (isCommandAction(event) && event.source === "user") {
      // For user commands, we always hide them from the chat interface
      return false;
    }

    const noRenderList = COMMON_NO_RENDER_LIST.concat(ACTION_NO_RENDER_LIST);
    return !noRenderList.includes(event.action);
  }

  if (isOpenReplicaObservation(event)) {
    if (isCommandObservation(event) && event.source === "user") {
      // For user commands, we always hide them from the chat interface
      return false;
    }

    return !COMMON_NO_RENDER_LIST.includes(event.observation);
  }

  return true;
};
