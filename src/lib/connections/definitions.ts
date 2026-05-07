export type ConnectionProviderId =
  | "google_drive"
  | "openai"
  | "n8n"
  | "youtube"
  | "instagram"
  | "facebook"
  | "snapchat"
  | "threads";

export type ConnectionField = {
  name: string;
  label: string;
  type: "text" | "password" | "url";
  secret: boolean;
  required: boolean;
  placeholder: string;
};

export type ConnectionDefinition = {
  id: ConnectionProviderId;
  label: string;
  description: string;
  permissionNote: string;
  fields: ConnectionField[];
};

export const connectionDefinitions: ConnectionDefinition[] = [
  {
    id: "google_drive",
    label: "Google Drive",
    description: "Private cloud storage for Folqen uploads and creator files.",
    permissionNote: "Use a dedicated private Drive folder. Folqen should not create public links by default.",
    fields: [
      { name: "clientId", label: "OAuth client ID", type: "text", secret: false, required: true, placeholder: "Google OAuth client id" },
      { name: "clientSecret", label: "OAuth client secret", type: "password", secret: true, required: true, placeholder: "Google OAuth client secret" },
      { name: "refreshToken", label: "Refresh token", type: "password", secret: true, required: true, placeholder: "Google OAuth refresh token" },
      { name: "folderId", label: "Private folder ID", type: "text", secret: false, required: true, placeholder: "Drive folder id for Folqen" },
    ],
  },
  {
    id: "openai",
    label: "OpenAI",
    description: "Real AI drafting provider for the Folqen agent.",
    permissionNote: "OpenAI can spend API credits. Folqen keeps paid-tool approval required before real generation.",
    fields: [
      { name: "apiKey", label: "OpenAI API key", type: "password", secret: true, required: true, placeholder: "sk-..." },
      { name: "model", label: "Default model", type: "text", secret: false, required: false, placeholder: "gpt-5-mini" },
    ],
  },
  {
    id: "n8n",
    label: "Oracle n8n",
    description: "Self-hosted workflow builder and safe connection-test webhook.",
    permissionNote: "Folqen will only test connection workflows until you explicitly approve real automation.",
    fields: [
      { name: "instanceUrl", label: "n8n instance URL", type: "url", secret: false, required: false, placeholder: "https://your-n8n-domain" },
      { name: "webhookUrl", label: "Webhook URL", type: "password", secret: true, required: true, placeholder: "n8n test webhook URL" },
      { name: "webhookSecret", label: "Shared webhook secret", type: "password", secret: true, required: true, placeholder: "shared secret checked by n8n" },
    ],
  },
  {
    id: "youtube",
    label: "YouTube",
    description: "Primary channel setup for manual packages now and OAuth later.",
    permissionNote: "Folqen will not ask for your YouTube password. Use OAuth when live posting is built.",
    fields: [
      { name: "channelUrl", label: "Channel URL", type: "url", secret: false, required: true, placeholder: "https://youtube.com/@yourchannel" },
      { name: "brandAccountEmail", label: "Brand account email", type: "text", secret: false, required: false, placeholder: "email used for channel admin" },
    ],
  },
  {
    id: "instagram",
    label: "Instagram",
    description: "Instagram profile/page setup for manual reels packages now and OAuth later.",
    permissionNote: "Use official Meta OAuth later. Do not enter your Instagram password.",
    fields: [
      { name: "profileUrl", label: "Profile URL", type: "url", secret: false, required: true, placeholder: "https://instagram.com/yourprofile" },
      { name: "businessAccountId", label: "Business account ID", type: "text", secret: false, required: false, placeholder: "Optional Meta business account id" },
    ],
  },
  {
    id: "facebook",
    label: "Facebook",
    description: "Facebook page setup for manual packages now and Meta OAuth later.",
    permissionNote: "Use official Meta OAuth later. Do not enter your Facebook password.",
    fields: [
      { name: "pageUrl", label: "Page URL", type: "url", secret: false, required: true, placeholder: "https://facebook.com/yourpage" },
      { name: "pageId", label: "Page ID", type: "text", secret: false, required: false, placeholder: "Optional page id" },
    ],
  },
  {
    id: "snapchat",
    label: "Snapchat",
    description: "Snapchat setup details for future manual/OAuth workflow.",
    permissionNote: "No password collection. Keep this as setup metadata until a safe API path is built.",
    fields: [{ name: "profileUrl", label: "Profile URL", type: "url", secret: false, required: true, placeholder: "Snapchat profile URL" }],
  },
  {
    id: "threads",
    label: "Threads",
    description: "Threads setup details for future manual/OAuth workflow.",
    permissionNote: "No password collection. Use Meta OAuth only when supported safely.",
    fields: [{ name: "profileUrl", label: "Profile URL", type: "url", secret: false, required: true, placeholder: "Threads profile URL" }],
  },
];

export function getConnectionDefinition(provider: string) {
  return connectionDefinitions.find((definition) => definition.id === provider);
}
