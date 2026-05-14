export type FirstRunResponse = {
  ok: boolean;
  researchBrief: unknown;
  scripts: unknown;
  thumbnailDraft: { status: string; previewUrl: string | null } | null;
  youtubeDraftPackage: {
    title: string;
    description: string;
    tags: string[];
    script: string;
    thumbnail: { previewUrl: string | null; status: string };
  };
  statuses: Record<string, string>;
  trace: Array<{ step: string; status: string; detail: string }>;
  safety?: Record<string, string>;
};

