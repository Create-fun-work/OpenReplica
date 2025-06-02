import { OpenReplicaParsedEvent } from ".";
import {
  UserMessageAction,
  AssistantMessageAction,
  OpenReplicaAction,
  SystemMessageAction,
  CommandAction,
} from "./actions";
import {
  AgentStateChangeObservation,
  CommandObservation,
  ErrorObservation,
  MCPObservation,
  OpenReplicaObservation,
} from "./observations";
import { StatusUpdate } from "./variances";

export const isOpenReplicaAction = (
  event: OpenReplicaParsedEvent,
): event is OpenReplicaAction => "action" in event;

export const isOpenReplicaObservation = (
  event: OpenReplicaParsedEvent,
): event is OpenReplicaObservation => "observation" in event;

export const isUserMessage = (
  event: OpenReplicaParsedEvent,
): event is UserMessageAction =>
  isOpenReplicaAction(event) &&
  event.source === "user" &&
  event.action === "message";

export const isAssistantMessage = (
  event: OpenReplicaParsedEvent,
): event is AssistantMessageAction =>
  isOpenReplicaAction(event) &&
  event.source === "agent" &&
  (event.action === "message" || event.action === "finish");

export const isErrorObservation = (
  event: OpenReplicaParsedEvent,
): event is ErrorObservation =>
  isOpenReplicaObservation(event) && event.observation === "error";

export const isCommandAction = (
  event: OpenReplicaParsedEvent,
): event is CommandAction => isOpenReplicaAction(event) && event.action === "run";

export const isAgentStateChangeObservation = (
  event: OpenReplicaParsedEvent,
): event is AgentStateChangeObservation =>
  isOpenReplicaObservation(event) && event.observation === "agent_state_changed";

export const isCommandObservation = (
  event: OpenReplicaParsedEvent,
): event is CommandObservation =>
  isOpenReplicaObservation(event) && event.observation === "run";

export const isFinishAction = (
  event: OpenReplicaParsedEvent,
): event is AssistantMessageAction =>
  isOpenReplicaAction(event) && event.action === "finish";

export const isSystemMessage = (
  event: OpenReplicaParsedEvent,
): event is SystemMessageAction =>
  isOpenReplicaAction(event) && event.action === "system";

export const isRejectObservation = (
  event: OpenReplicaParsedEvent,
): event is OpenReplicaObservation =>
  isOpenReplicaObservation(event) && event.observation === "user_rejected";

export const isMcpObservation = (
  event: OpenReplicaParsedEvent,
): event is MCPObservation =>
  isOpenReplicaObservation(event) && event.observation === "mcp";

export const isStatusUpdate = (
  event: OpenReplicaParsedEvent,
): event is StatusUpdate =>
  "status_update" in event && "type" in event && "id" in event;
