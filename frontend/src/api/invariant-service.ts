import { openreplica } from "./openreplica-axios";

class InvariantService {
  static async getPolicy() {
    const { data } = await openreplica.get("/api/security/policy");
    return data.policy;
  }

  static async getRiskSeverity() {
    const { data } = await openreplica.get("/api/security/settings");
    return data.RISK_SEVERITY;
  }

  static async getTraces() {
    const { data } = await openreplica.get("/api/security/export-trace");
    return data;
  }

  static async updatePolicy(policy: string) {
    await openreplica.post("/api/security/policy", { policy });
  }

  static async updateRiskSeverity(riskSeverity: number) {
    await openreplica.post("/api/security/settings", {
      RISK_SEVERITY: riskSeverity,
    });
  }
}

export default InvariantService;
