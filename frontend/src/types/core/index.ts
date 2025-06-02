import { OpenReplicaAction } from "./actions";
import { OpenReplicaObservation } from "./observations";
import { OpenReplicaVariance } from "./variances";

export type OpenReplicaParsedEvent =
  | OpenReplicaAction
  | OpenReplicaObservation
  | OpenReplicaVariance;
