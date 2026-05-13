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
  FOLQEN_RUNTIME_PROFILE: z.enum(["local", "preview", "docker", "vps", "coolify", "vercel"]).default("local"),
  PREVIEW_SAFE_MODE: booleanFlag("false"),
  PREVIEW_FORCE_DRY_RUN: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  REQUIRE_STARTUP_VALIDATION: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  STARTUP_DRY_RUN_MODE: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  STARTUP_ROLLBACK_MODE: booleanFlag("false"),
  STARTUP_QUARANTINE_MODE: booleanFlag("false"),
  STARTUP_KILL_SWITCH: booleanFlag("false"),
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
  APP_BASE_URL: z.string().optional(),
  CREDENTIAL_ENCRYPTION_KEY: z.string().optional(),
  N8N_WEBHOOK_URL: z.string().optional(),
  N8N_WEBHOOK_SECRET: z.string().optional(),
  ORACLE_N8N_INSTANCE_URL: z.string().optional(),
  BROWSER_OPERATIONS_SANDBOX_MODE: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  BROWSER_OPERATIONS_KILL_SWITCH: booleanFlag("false"),
  BROWSER_OPERATIONS_MAX_SESSION_SECONDS: z.coerce.number().int().min(5).max(900).default(60),
  BROWSER_OPERATIONS_ALLOWED_DOMAINS: z.string().default("localhost,127.0.0.1,folqen.vercel.app"),
  BROWSER_OPERATIONS_BLOCKED_DOMAINS: z.string().default("accounts.google.com,facebook.com,instagram.com,youtube.com,x.com,twitter.com,linkedin.com,stripe.com,paypal.com"),
  LOCAL_WORKER_BASE_URL: z.string().optional(),
  LOCAL_WORKER_SHARED_SECRET: z.string().optional(),
  COMFYUI_BASE_URL: z.string().optional(),
  FFMPEG_PATH: z.string().optional(),
  TTS_PROVIDER_URL: z.string().optional(),
  ALLOW_CONTROLLED_MEDIA_EXECUTION: booleanFlag("false"),
  ALLOW_LIVE_THUMBNAIL_RENDERING: booleanFlag("false"),
  LIVE_MEDIA_ACTIVATION_STAGE: z.coerce.number().int().min(0).max(4).default(0),
  LIVE_THUMBNAIL_RENDER_STAGE: z.coerce.number().int().min(0).max(4).default(0),
  THUMBNAIL_RENDER_PROVIDER: z.enum(["local_worker"]).default("local_worker"),
  THUMBNAIL_RENDER_SANDBOX_FALLBACK: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  MEDIA_RENDER_KILL_SWITCH: booleanFlag("false"),
  MEDIA_RENDER_EMERGENCY_STOP: booleanFlag("false"),
  MEDIA_RENDER_MAX_DAILY_RUNS: z.coerce.number().int().min(0).max(100).default(3),
  MEDIA_RENDER_MAX_CONCURRENCY: z.coerce.number().int().min(0).max(10).default(1),
  MEDIA_RENDER_MAX_SECONDS: z.coerce.number().int().min(1).max(3600).default(120),
  MEDIA_RENDER_MAX_ESTIMATED_GPU_MINUTES: z.coerce.number().min(0).max(1000).default(2),
  GOOGLE_DRIVE_CLIENT_ID: z.string().optional(),
  GOOGLE_DRIVE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_DRIVE_REFRESH_TOKEN: z.string().optional(),
  GOOGLE_DRIVE_FOLDER_ID: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  CLAUDE_API_KEY: z.string().optional(),
  OPENAI_COMPATIBLE_BASE_URL: z.string().optional(),
  OPENAI_COMPATIBLE_API_KEY: z.string().optional(),
  OLLAMA_BASE_URL: z.string().optional(),
  LOCAL_LLM_BASE_URL: z.string().optional(),
  ALLOW_LIVE_AI_EXECUTION: booleanFlag("false"),
  LIVE_AI_ACTIVATION_STAGE: z.coerce.number().int().min(0).max(4).default(0),
  AI_RUNTIME_KILL_SWITCH: booleanFlag("false"),
  AI_RUNTIME_EMERGENCY_STOP: booleanFlag("false"),
  MEMORY_EMBEDDINGS_PROVIDER: z.enum(["mock", "openai", "gemini"]).default("mock"),
  MEMORY_EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(1536),
  REDIS_URL: z.string().optional(),
  BULLMQ_PREFIX: z.string().default("folqen"),
  ORCHESTRATION_EXECUTION_MODE: z.enum(["mock", "live"]).default("mock"),
  ORCHESTRATION_WORKER_ENABLED: booleanFlag("false"),
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
