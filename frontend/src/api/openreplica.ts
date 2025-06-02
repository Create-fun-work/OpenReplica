import { AxiosHeaders } from "axios";
import {
  Feedback,
  FeedbackResponse,
  GitHubAccessTokenResponse,
  GetConfigResponse,
  GetVSCodeUrlResponse,
  AuthenticateResponse,
  Conversation,
  ResultSet,
  GetTrajectoryResponse,
  GitChangeDiff,
  GitChange,
} from "./openreplica.types";
import { openreplica } from "./openreplica-axios";
import { ApiSettings, PostApiSettings, Provider } from "#/types/settings";
import { GitUser, GitRepository, Branch } from "#/types/git";
import { SuggestedTask } from "#/components/features/home/tasks/task.types";

class OpenReplica {
  private static currentConversation: Conversation | null = null;

  /**
   * Get a current conversation
   * @return the current conversation
   */
  static getCurrentConversation(): Conversation | null {
    return this.currentConversation;
  }

  /**
   * Set a current conversation
   * @param url Custom URL to use for conversation endpoints
   */
  static setCurrentConversation(
    currentConversation: Conversation | null,
  ): void {
    this.currentConversation = currentConversation;
  }

  /**
   * Get the url for the conversation. If
   */
  static getConversationUrl(conversationId: string): string {
    if (this.currentConversation?.conversation_id === conversationId) {
      if (this.currentConversation.url) {
        return this.currentConversation.url;
      }
    }
    return `/api/conversations/${conversationId}`;
  }

  /**
   * Retrieve the list of models available
   * @returns List of models available
   */
  static async getModels(): Promise<string[]> {
    const { data } = await openreplica.get<string[]>("/api/options/models");
    return data;
  }

  /**
   * Retrieve the list of agents available
   * @returns List of agents available
   */
  static async getAgents(): Promise<string[]> {
    const { data } = await openreplica.get<string[]>("/api/options/agents");
    return data;
  }

  /**
   * Retrieve the list of security analyzers available
   * @returns List of security analyzers available
   */
  static async getSecurityAnalyzers(): Promise<string[]> {
    const { data } = await openreplica.get<string[]>(
      "/api/options/security-analyzers",
    );
    return data;
  }

  static async getConfig(): Promise<GetConfigResponse> {
    const { data } = await openreplica.get<GetConfigResponse>(
      "/api/options/config",
    );
    return data;
  }

  static getConversationHeaders(): AxiosHeaders {
    const headers = new AxiosHeaders();
    const sessionApiKey = this.currentConversation?.session_api_key;
    if (sessionApiKey) {
      headers.set("X-Session-API-Key", sessionApiKey);
    }
    return headers;
  }

  /**
   * Send feedback to the server
   * @param data Feedback data
   * @returns The stored feedback data
   */
  static async submitFeedback(
    conversationId: string,
    feedback: Feedback,
  ): Promise<FeedbackResponse> {
    const url = `/api/conversations/${conversationId}/submit-feedback`;
    const { data } = await openreplica.post<FeedbackResponse>(url, feedback);
    return data;
  }

  /**
   * Authenticate with GitHub token
   * @returns Response with authentication status and user info if successful
   */
  static async authenticate(
    appMode: GetConfigResponse["APP_MODE"],
  ): Promise<boolean> {
    if (appMode === "oss") return true;

    // Just make the request, if it succeeds (no exception thrown), return true
    await openreplica.post<AuthenticateResponse>("/api/authenticate");
    return true;
  }

  /**
   * Get the blob of the workspace zip
   * @returns Blob of the workspace zip
   */
  static async getWorkspaceZip(conversationId: string): Promise<Blob> {
    const url = `${this.getConversationUrl(conversationId)}/zip-directory`;
    const response = await openreplica.get(url, {
      responseType: "blob",
      headers: this.getConversationHeaders(),
    });
    return response.data;
  }

  /**
   * Get the web hosts
   * @returns Array of web hosts
   */
  static async getWebHosts(conversationId: string): Promise<string[]> {
    const url = `${this.getConversationUrl(conversationId)}/web-hosts`;
    const response = await openreplica.get(url, {
      headers: this.getConversationHeaders(),
    });
    return Object.keys(response.data.hosts);
  }

  /**
   * @param code Code provided by GitHub
   * @returns GitHub access token
   */
  static async getGitHubAccessToken(
    code: string,
  ): Promise<GitHubAccessTokenResponse> {
    const { data } = await openreplica.post<GitHubAccessTokenResponse>(
      "/api/keycloak/callback",
      {
        code,
      },
    );
    return data;
  }

  /**
   * Get the VSCode URL
   * @returns VSCode URL
   */
  static async getVSCodeUrl(
    conversationId: string,
  ): Promise<GetVSCodeUrlResponse> {
    const url = `${this.getConversationUrl(conversationId)}/vscode-url`;
    const { data } = await openreplica.get<GetVSCodeUrlResponse>(url, {
      headers: this.getConversationHeaders(),
    });
    return data;
  }

  static async getRuntimeId(
    conversationId: string,
  ): Promise<{ runtime_id: string }> {
    const url = `${this.getConversationUrl(conversationId)}/config`;
    const { data } = await openreplica.get<{ runtime_id: string }>(url, {
      headers: this.getConversationHeaders(),
    });
    return data;
  }

  static async getUserConversations(): Promise<Conversation[]> {
    const { data } = await openreplica.get<ResultSet<Conversation>>(
      "/api/conversations?limit=20",
    );
    return data.results;
  }

  static async deleteUserConversation(conversationId: string): Promise<void> {
    await openreplica.delete(`/api/conversations/${conversationId}`);
  }

  static async createConversation(
    selectedRepository?: string,
    git_provider?: Provider,
    initialUserMsg?: string,
    imageUrls?: string[],
    replayJson?: string,
    suggested_task?: SuggestedTask,
    selected_branch?: string,
  ): Promise<Conversation> {
    const body = {
      repository: selectedRepository,
      git_provider,
      selected_branch,
      initial_user_msg: initialUserMsg,
      image_urls: imageUrls,
      replay_json: replayJson,
      suggested_task,
    };

    const { data } = await openreplica.post<Conversation>(
      "/api/conversations",
      body,
    );

    return data;
  }

  static async getConversation(
    conversationId: string,
  ): Promise<Conversation | null> {
    const { data } = await openreplica.get<Conversation | null>(
      `/api/conversations/${conversationId}`,
    );

    return data;
  }

  /**
   * Get the settings from the server or use the default settings if not found
   */
  static async getSettings(): Promise<ApiSettings> {
    const { data } = await openreplica.get<ApiSettings>("/api/settings");
    return data;
  }

  /**
   * Save the settings to the server. Only valid settings are saved.
   * @param settings - the settings to save
   */
  static async saveSettings(
    settings: Partial<PostApiSettings>,
  ): Promise<boolean> {
    const data = await openreplica.post("/api/settings", settings);
    return data.status === 200;
  }

  static async createCheckoutSession(amount: number): Promise<string> {
    const { data } = await openreplica.post(
      "/api/billing/create-checkout-session",
      {
        amount,
      },
    );
    return data.redirect_url;
  }

  static async createBillingSessionResponse(): Promise<string> {
    const { data } = await openreplica.post(
      "/api/billing/create-customer-setup-session",
    );
    return data.redirect_url;
  }

  static async getBalance(): Promise<string> {
    const { data } = await openreplica.get<{ credits: string }>(
      "/api/billing/credits",
    );
    return data.credits;
  }

  static async getGitUser(): Promise<GitUser> {
    const response = await openreplica.get<GitUser>("/api/user/info");

    const { data } = response;

    const user: GitUser = {
      id: data.id,
      login: data.login,
      avatar_url: data.avatar_url,
      company: data.company,
      name: data.name,
      email: data.email,
    };

    return user;
  }

  static async searchGitRepositories(
    query: string,
    per_page = 5,
  ): Promise<GitRepository[]> {
    const response = await openreplica.get<GitRepository[]>(
      "/api/user/search/repositories",
      {
        params: {
          query,
          per_page,
        },
      },
    );

    return response.data;
  }

  static async getTrajectory(
    conversationId: string,
  ): Promise<GetTrajectoryResponse> {
    const url = `${this.getConversationUrl(conversationId)}/trajectory`;
    const { data } = await openreplica.get<GetTrajectoryResponse>(url, {
      headers: this.getConversationHeaders(),
    });
    return data;
  }

  static async logout(appMode: GetConfigResponse["APP_MODE"]): Promise<void> {
    const endpoint =
      appMode === "saas" ? "/api/logout" : "/api/unset-provider-tokens";
    await openreplica.post(endpoint);
  }

  static async getGitChanges(conversationId: string): Promise<GitChange[]> {
    const url = `${this.getConversationUrl(conversationId)}/git/changes`;
    const { data } = await openreplica.get<GitChange[]>(url, {
      headers: this.getConversationHeaders(),
    });
    return data;
  }

  static async getGitChangeDiff(
    conversationId: string,
    path: string,
  ): Promise<GitChangeDiff> {
    const url = `${this.getConversationUrl(conversationId)}/git/diff`;
    const { data } = await openreplica.get<GitChangeDiff>(url, {
      params: { path },
      headers: this.getConversationHeaders(),
    });
    return data;
  }

  /**
   * Given a PAT, retrieves the repositories of the user
   * @returns A list of repositories
   */
  static async retrieveUserGitRepositories() {
    const { data } = await openreplica.get<GitRepository[]>(
      "/api/user/repositories",
      {
        params: {
          sort: "pushed",
        },
      },
    );

    return data;
  }

  static async getRepositoryBranches(repository: string): Promise<Branch[]> {
    const { data } = await openreplica.get<Branch[]>(
      `/api/user/repository/branches?repository=${encodeURIComponent(repository)}`,
    );

    return data;
  }

  // ========================================
  // OpenReplica Custom Features API Methods
  // ========================================

  /**
   * Microagents Management API
   */
  static async getMicroagents(type?: string): Promise<any[]> {
    const params = type ? `?microagent_type=${type}` : '';
    const { data } = await openreplica.get(`/api/microagents${params}`);
    return data;
  }

  static async getMicroagent(name: string): Promise<any> {
    const { data } = await openreplica.get(`/api/microagents/${name}`);
    return data;
  }

  static async createMicroagent(microagent: any): Promise<any> {
    const { data } = await openreplica.post('/api/microagents/', microagent);
    return data;
  }

  static async updateMicroagent(name: string, microagent: any): Promise<any> {
    const { data } = await openreplica.put(`/api/microagents/${name}`, microagent);
    return data;
  }

  static async deleteMicroagent(name: string): Promise<void> {
    await openreplica.delete(`/api/microagents/${name}`);
  }

  static async testMicroagent(name: string, message: string): Promise<any> {
    const { data } = await openreplica.post(`/api/microagents/${name}/test`, { message });
    return data;
  }

  static async getMicroagentTemplates(): Promise<any> {
    const { data } = await openreplica.get('/api/microagents/builtin/templates');
    return data;
  }

  static async importMicroagent(name: string, content: string): Promise<any> {
    const { data } = await openreplica.post('/api/microagents/import', { name, content });
    return data;
  }

  static async exportMicroagent(name: string): Promise<any> {
    const { data } = await openreplica.post(`/api/microagents/${name}/export`);
    return data;
  }

  /**
   * Sessions Management API
   */
  static async getSessions(): Promise<{ sessions: any[] }> {
    const { data } = await openreplica.get('/api/sessions/');
    return data;
  }

  static async getSession(sessionId: string): Promise<any> {
    const { data } = await openreplica.get(`/api/sessions/${sessionId}`);
    return data;
  }

  static async createSession(session: any): Promise<any> {
    const { data } = await openreplica.post('/api/sessions/create', session);
    return data;
  }

  static async deleteSession(sessionId: string): Promise<void> {
    await openreplica.delete(`/api/sessions/${sessionId}`);
  }

  static async getSessionMessages(sessionId: string): Promise<{ messages: any[] }> {
    const { data } = await openreplica.get(`/api/sessions/${sessionId}/messages`);
    return data;
  }

  static async addSessionMessage(sessionId: string, content: string, role: string = 'user'): Promise<any> {
    const { data } = await openreplica.post(`/api/sessions/${sessionId}/messages`, { content, role });
    return data;
  }

  static async getSessionEvents(sessionId: string): Promise<{ events: any[] }> {
    const { data } = await openreplica.get(`/api/sessions/${sessionId}/events`);
    return data;
  }

  static async addSessionEvent(sessionId: string, eventData: any): Promise<void> {
    await openreplica.post(`/api/sessions/${sessionId}/events`, eventData);
  }
}

export default OpenReplica;
