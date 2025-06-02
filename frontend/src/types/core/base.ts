export type OpenReplicaEventType =
  | "message"
  | "system"
  | "agent_state_changed"
  | "change_agent_state"
  | "run"
  | "read"
  | "write"
  | "edit"
  | "run_ipython"
  | "delegate"
  | "browse"
  | "browse_interactive"
  | "reject"
  | "think"
  | "finish"
  | "error"
  | "recall"
  | "mcp"
  | "call_tool_mcp"
  | "user_rejected";

export type OpenReplicaSourceType = "agent" | "user" | "environment";

interface OpenReplicaBaseEvent {
  id: number;
  source: OpenReplicaSourceType;
  message: string;
  timestamp: string; // ISO 8601
}

export interface OpenReplicaActionEvent<T extends OpenReplicaEventType>
  extends OpenReplicaBaseEvent {
  action: T;
  args: Record<string, unknown>;
}

export interface OpenReplicaObservationEvent<T extends OpenReplicaEventType>
  extends OpenReplicaBaseEvent {
  cause: number;
  observation: T;
  content: string;
  extras: Record<string, unknown>;
}
