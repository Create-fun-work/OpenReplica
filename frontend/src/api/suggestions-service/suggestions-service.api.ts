import { SuggestedTask } from "#/components/features/home/tasks/task.types";
import { openreplica } from "../openreplica-axios";

export class SuggestionsService {
  static async getSuggestedTasks(): Promise<SuggestedTask[]> {
    const { data } = await openreplica.get("/api/user/suggested-tasks");
    return data;
  }
}
