import type { NicheTemplate, NicheTemplateId } from "@/lib/public-release/types";

export const nicheTemplates: NicheTemplate[] = [
  {
    id: "horror_shorts",
    label: "Horror Shorts",
    positioning: "Fast, high-retention mystery storytelling for short-form platforms.",
    defaultPlatforms: ["YOUTUBE", "INSTAGRAM", "FACEBOOK", "THREADS"],
    workforce: [
      { id: "research-trends", title: "Trend Research Agent", focus: "Find emerging horror/mystery angles with regional relevance." },
      { id: "hook-operator", title: "Hook Generation Agent", focus: "Create curiosity-first hook variants for shorts." },
      { id: "script-operator", title: "Script Generation Agent", focus: "Build suspense scripts with clear escalation beats." },
      { id: "metadata-operator", title: "Metadata Agent", focus: "Optimize titles, hashtags, and descriptions per platform." },
    ],
    workflows: [
      { id: "trend_discovery", name: "Trend Discovery", summary: "Discover rising horror topics and momentum signals.", department: "Research" },
      { id: "topic_intelligence", name: "Topic Intelligence", summary: "Score candidate ideas by retention and novelty fit.", department: "Research" },
      { id: "hook_generation", name: "Hook Optimization", summary: "Generate short hook sets for A/B testing.", department: "Content" },
      { id: "script_generation", name: "Script Generation", summary: "Draft 30-60 second narrative scripts.", department: "Content" },
      { id: "metadata_optimization", name: "Metadata Optimization", summary: "Create platform-aware metadata packs.", department: "Content" },
    ],
    strategyStarter: [
      "Lead each short with a question that creates immediate tension.",
      "Anchor stories in folklore framing: mystery first, claim caution second.",
      "Use episodic clusters (haunted places, cursed objects, unsolved legends).",
    ],
  },
  {
    id: "ai_news",
    label: "AI News",
    positioning: "Rapid AI update explainers for high-frequency short content.",
    defaultPlatforms: ["YOUTUBE", "LINKEDIN", "THREADS", "INSTAGRAM"],
    workforce: [
      { id: "research-news", title: "AI News Research Agent", focus: "Track high-impact AI launches, updates, and pricing shifts." },
      { id: "summary-agent", title: "Insight Summarizer", focus: "Convert technical updates into plain-language narratives." },
      { id: "script-agent", title: "Short Script Agent", focus: "Build tight explainers with benefit-first framing." },
      { id: "analytics-agent", title: "Performance Agent", focus: "Measure retention by topic category and depth." },
    ],
    workflows: [
      { id: "news_signal_scan", name: "News Signal Scan", summary: "Collect launch and update signals.", department: "Research" },
      { id: "insight_packaging", name: "Insight Packaging", summary: "Convert updates into audience-specific angles.", department: "Content" },
      { id: "script_generation", name: "Script Generation", summary: "Generate short explainers per platform.", department: "Content" },
      { id: "performance_review", name: "Performance Review", summary: "Extract winners/losers from watch behavior.", department: "Analytics" },
    ],
    strategyStarter: ["Use a what changed / why it matters structure.", "Separate hype claims from verified updates.", "Prioritize speed without sacrificing clarity."],
  },
  {
    id: "tech_explainers",
    label: "Tech Explainers",
    positioning: "Practical, concise educational explainers for mainstream tech users.",
    defaultPlatforms: ["YOUTUBE", "INSTAGRAM", "LINKEDIN", "FACEBOOK"],
    workforce: [
      { id: "research-tech", title: "Tech Research Agent", focus: "Find evergreen and trend-linked tech topics." },
      { id: "framework-agent", title: "Explainer Framework Agent", focus: "Turn topics into step-by-step flows." },
      { id: "script-agent", title: "Script Agent", focus: "Create concise educational scripts with examples." },
      { id: "metadata-agent", title: "Metadata Agent", focus: "Optimize searchable naming and tags." },
    ],
    workflows: [
      { id: "topic_intelligence", name: "Topic Intelligence", summary: "Score topics by utility and search intent.", department: "Research" },
      { id: "script_generation", name: "Script Generation", summary: "Draft clear explainer scripts.", department: "Content" },
      { id: "platform_adaptation", name: "Platform Adaptation", summary: "Adjust script depth by platform context.", department: "Content" },
    ],
    strategyStarter: ["Start with practical user pain.", "Use one idea per short.", "End with a concrete next action."],
  },
  {
    id: "motivation_edits",
    label: "Motivation Edits",
    positioning: "Emotionally resonant short content with high hook intensity.",
    defaultPlatforms: ["INSTAGRAM", "YOUTUBE", "FACEBOOK", "THREADS"],
    workforce: [
      { id: "quote-research", title: "Theme Research Agent", focus: "Identify themes with emotional pull." },
      { id: "hook-agent", title: "Opening Hook Agent", focus: "Generate hard-hitting opening lines." },
      { id: "caption-agent", title: "Caption Agent", focus: "Create concise, shareable captions." },
      { id: "platform-agent", title: "Platform Agent", focus: "Adapt energy and framing for platform norms." },
    ],
    workflows: [
      { id: "trend_discovery", name: "Theme Discovery", summary: "Find high-resonance motivation topics.", department: "Research" },
      { id: "hook_generation", name: "Hook Generation", summary: "Generate multiple first-line variants.", department: "Content" },
      { id: "caption_generation", name: "Caption Generation", summary: "Create short caption sets and CTA lines.", department: "Content" },
    ],
    strategyStarter: ["Open with friction, resolve with action.", "Use short phrases and clear rhythm.", "Maintain consistency in voice and cadence."],
  },
  {
    id: "educational_shorts",
    label: "Educational Shorts",
    positioning: "Rapid educational storytelling for curiosity-driven audiences.",
    defaultPlatforms: ["YOUTUBE", "INSTAGRAM", "FACEBOOK", "SUBSTACK"],
    workforce: [
      { id: "research-agent", title: "Research Agent", focus: "Find educational topics with high demand." },
      { id: "topic-agent", title: "Topic Selection Agent", focus: "Rank by value and relevance." },
      { id: "script-agent", title: "Script Agent", focus: "Build concise educational scripts." },
      { id: "qa-agent", title: "Quality Agent", focus: "Enforce clarity and factual caution." },
    ],
    workflows: [
      { id: "trend_discovery", name: "Demand Discovery", summary: "Find high-demand learning angles.", department: "Research" },
      { id: "topic_selection", name: "Topic Selection", summary: "Pick top candidate topics.", department: "Content" },
      { id: "script_generation", name: "Script Generation", summary: "Produce educational short scripts.", department: "Content" },
      { id: "reflection", name: "Reflection Loop", summary: "Evaluate clarity and retention feedback.", department: "Analytics" },
    ],
    strategyStarter: ["Define one lesson objective per short.", "Use simple analogies.", "End with a reinforcement recap."],
  },
  {
    id: "faceless_automation",
    label: "Faceless Automation",
    positioning: "Systemized content operations with reusable templates and workflows.",
    defaultPlatforms: ["YOUTUBE", "INSTAGRAM", "FACEBOOK", "THREADS", "LINKEDIN"],
    workforce: [
      { id: "strategy-agent", title: "Strategy Agent", focus: "Set repeatable content frameworks." },
      { id: "pipeline-agent", title: "Pipeline Agent", focus: "Manage template-driven workflows." },
      { id: "content-agent", title: "Content Agent", focus: "Generate consistent assets and scripts." },
      { id: "analytics-agent", title: "Analytics Agent", focus: "Drive iterative optimization recommendations." },
    ],
    workflows: [
      { id: "workflow_template_bootstrap", name: "Workflow Bootstrap", summary: "Initialize reusable content pipelines.", department: "Operations" },
      { id: "content_batch_plan", name: "Batch Planning", summary: "Prepare weekly batch topic plans.", department: "Content" },
      { id: "metadata_optimization", name: "Metadata Optimization", summary: "Generate platform-specific metadata at scale.", department: "Content" },
      { id: "performance_review", name: "Performance Review", summary: "Evaluate batch outputs and suggest optimizations.", department: "Analytics" },
    ],
    strategyStarter: ["Design for repeatability before scale.", "Use consistent template families.", "Review weekly and optimize by evidence."],
  },
];

export function getNicheTemplate(templateId: NicheTemplateId) {
  return nicheTemplates.find((template) => template.id === templateId) ?? nicheTemplates[0];
}

