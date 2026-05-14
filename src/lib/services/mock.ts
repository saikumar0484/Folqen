import { validateUploadCandidate } from "@/lib/files/validation";
import type { FolqenServices, ServiceResult } from "@/lib/services/types";

function mockResult<T>(message: string, data?: T): ServiceResult<T> {
  return {
    ok: true,
    status: "mock",
    message,
    data,
  };
}

function blockedResult<T>(message: string): ServiceResult<T> {
  return {
    ok: false,
    status: "not_connected",
    message,
  };
}

export const mockFolqenServices: FolqenServices = {
  agent: {
    async createMessage(input) {
      return mockResult("Mock agent reply created. No external AI provider was called.", {
        reply: `I can prepare a safe draft plan for: ${input.content}`,
      });
    },
    async runCommand(command) {
      return mockResult(`Command accepted in mock mode: ${command}`, { queued: false });
    },
  },
  workflow: {
    async testConnection() {
      return blockedResult("n8n is Not connected. Add webhook secrets before testing a real workflow.");
    },
    async triggerWorkflow() {
      return blockedResult("Workflow execution is blocked until n8n is configured and the action is approved.");
    },
  },
  render: {
    async renderDraft() {
      return blockedResult("Render service is Not connected. Configure local FFmpeg or another render provider first.");
    },
  },
  publishing: {
    async createPostingPackage(input) {
      return mockResult("Manual posting package can be prepared because platform APIs are Not connected.", {
        packageId: `manual-${input.platform.toLowerCase()}-${input.contentId}`,
        mode: "manual",
      });
    },
    async publishPublicly() {
      return blockedResult("Public publishing is blocked by default and requires all safety gates plus human approval.");
    },
  },
  analytics: {
    async readMetrics() {
      return blockedResult("Live analytics are Not connected. Use stored AnalyticsRecord rows until a provider is configured.");
    },
  },
  storage: {
    async validateUpload(input) {
      const result = validateUploadCandidate(input);

      if (!result.allowed) {
        return {
          ok: false,
          status: "mock",
          message: result.reasons.join(" "),
        };
      }

      return mockResult("Upload candidate passed validation. Storage write is still disabled.", {
        sanitizedName: result.sanitizedName,
      });
    },
    async storeUpload() {
      return blockedResult("Storage writes are disabled until the upload endpoint, storage path policy, and audit logs are implemented.");
    },
  },
  notifications: {
    async notify() {
      return mockResult("Notification captured in mock mode. No external push/email provider was called.", {
        delivered: false,
      });
    },
  },
};

export function getFolqenServices(): FolqenServices {
  return mockFolqenServices;
}
