import { z } from "zod";

function booleanFlag(defaultValue: "true" | "false" = "false") {
  return z
    .enum(["true", "false"])
    .default(defaultValue)
    .transform((value) => value === "true");
}

export const envSchema = z.object({
  ALLOW_PUBLIC_PUBLISH: booleanFlag("false"),
  REQUIRE_HUMAN_APPROVAL: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  ALLOW_PAID_TOOLS: booleanFlag("false"),
  ALLOW_BROWSER_AUTOMATION: booleanFlag("false"),
  DEFAULT_UPLOAD_PRIVACY: z.enum(["private", "unlisted", "public"]).default("private"),
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
  APP_BASE_URL: z.string().optional(),
  CREDENTIAL_ENCRYPTION_KEY: z.string().optional(),
  N8N_WEBHOOK_URL: z.string().optional(),
  N8N_WEBHOOK_SECRET: z.string().optional(),
  ORACLE_N8N_INSTANCE_URL: z.string().optional(),
  LOCAL_WORKER_BASE_URL: z.string().optional(),
  LOCAL_WORKER_SHARED_SECRET: z.string().optional(),
  COMFYUI_BASE_URL: z.string().optional(),
  FFMPEG_PATH: z.string().optional(),
  TTS_PROVIDER_URL: z.string().optional(),
  GOOGLE_DRIVE_CLIENT_ID: z.string().optional(),
  GOOGLE_DRIVE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_DRIVE_REFRESH_TOKEN: z.string().optional(),
  GOOGLE_DRIVE_FOLDER_ID: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  SELF_IMPROVEMENT_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  AUTO_EXECUTE_UPGRADES: booleanFlag("false"),
  REQUIRE_UPGRADE_APPROVAL: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  ALLOW_PAID_RESEARCH_TOOLS: booleanFlag("false"),
  MAX_MONTHLY_RESEARCH_COST_INR: z.coerce.number().default(0),
});

export type FolqenEnv = z.infer<typeof envSchema>;

export function getEnv(source: NodeJS.ProcessEnv = process.env): FolqenEnv {
  return envSchema.parse(source);
}
