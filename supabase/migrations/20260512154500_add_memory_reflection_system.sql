create extension if not exists vector;

create table if not exists "MemoryEntry" (
  "id" text primary key,
  "category" text not null,
  "scope" text not null default 'organization',
  "subjectType" text,
  "subjectId" text,
  "departmentId" text,
  "agentId" text,
  "title" text not null,
  "summary" text not null,
  "content" text not null,
  "tags" text[] not null default '{}',
  "importance" double precision not null default 0.5,
  "confidence" double precision not null default 0.5,
  "sourceType" text not null,
  "sourceId" text,
  "embedding" vector(1536),
  "embeddingModel" text,
  "embeddingStatus" text not null default 'mock',
  "metadata" jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "MemoryReflection" (
  "id" text primary key,
  "memoryId" text references "MemoryEntry"("id") on delete set null,
  "workflowRunId" text,
  "reflectionType" text not null,
  "summary" text not null,
  "qualityScore" double precision not null default 0.5,
  "bottlenecks" jsonb,
  "recommendations" jsonb,
  "strategyNotes" jsonb,
  "metadata" jsonb,
  "createdAt" timestamptz not null default now()
);

create table if not exists "ExperimentRecord" (
  "id" text primary key,
  "memoryId" text references "MemoryEntry"("id") on delete set null,
  "experimentType" text not null,
  "name" text not null,
  "hypothesis" text not null,
  "variants" jsonb not null,
  "metrics" jsonb,
  "status" text not null default 'draft',
  "winnerKey" text,
  "confidence" double precision not null default 0.5,
  "recommendation" text,
  "metadata" jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "MemoryEntry_category_idx" on "MemoryEntry" ("category");
create index if not exists "MemoryEntry_departmentId_idx" on "MemoryEntry" ("departmentId");
create index if not exists "MemoryEntry_agentId_idx" on "MemoryEntry" ("agentId");
create index if not exists "MemoryEntry_sourceType_sourceId_idx" on "MemoryEntry" ("sourceType", "sourceId");
create index if not exists "MemoryEntry_tags_gin_idx" on "MemoryEntry" using gin ("tags");
create index if not exists "MemoryReflection_memoryId_idx" on "MemoryReflection" ("memoryId");
create index if not exists "MemoryReflection_workflowRunId_idx" on "MemoryReflection" ("workflowRunId");
create index if not exists "MemoryReflection_reflectionType_idx" on "MemoryReflection" ("reflectionType");
create index if not exists "ExperimentRecord_memoryId_idx" on "ExperimentRecord" ("memoryId");
create index if not exists "ExperimentRecord_experimentType_idx" on "ExperimentRecord" ("experimentType");
create index if not exists "ExperimentRecord_status_idx" on "ExperimentRecord" ("status");

create index if not exists "MemoryEntry_embedding_ivfflat_idx"
  on "MemoryEntry"
  using ivfflat ("embedding" vector_cosine_ops)
  with (lists = 100)
  where "embedding" is not null;

alter table "MemoryEntry" enable row level security;
alter table "MemoryReflection" enable row level security;
alter table "ExperimentRecord" enable row level security;
