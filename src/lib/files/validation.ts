export const MAX_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024;

const allowedTypes = new Map<string, Set<string>>([
  ["image/png", new Set([".png"])],
  ["image/jpeg", new Set([".jpg", ".jpeg"])],
  ["image/webp", new Set([".webp"])],
  ["video/mp4", new Set([".mp4"])],
  ["video/webm", new Set([".webm"])],
  ["audio/mpeg", new Set([".mp3"])],
  ["audio/wav", new Set([".wav"])],
  ["audio/ogg", new Set([".ogg"])],
  ["application/pdf", new Set([".pdf"])],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", new Set([".docx"])],
  ["text/plain", new Set([".txt"])],
  ["text/markdown", new Set([".md"])],
  ["text/csv", new Set([".csv"])],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", new Set([".xlsx"])],
  ["application/json", new Set([".json"])],
  ["application/yaml", new Set([".yaml", ".yml"])],
  ["text/yaml", new Set([".yaml", ".yml"])],
  ["application/x-subrip", new Set([".srt"])],
  ["text/vtt", new Set([".vtt"])],
]);

type UploadCandidate = {
  name: string;
  mimeType: string;
  sizeBytes: number;
};

export type FileValidationResult =
  | { allowed: true; sanitizedName: string; extension: string; mimeType: string; sizeBytes: number }
  | { allowed: false; reasons: string[] };

function getExtension(name: string) {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === name.length - 1) return "";
  return name.slice(dotIndex).toLowerCase();
}

function sanitizeFileName(name: string) {
  return name
    .trim()
    .replaceAll("\\", "/")
    .split("/")
    .pop()
    ?.replace(/[^a-zA-Z0-9._ -]/g, "_")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

export function validateUploadCandidate(candidate: UploadCandidate): FileValidationResult {
  const reasons: string[] = [];
  const sanitizedName = sanitizeFileName(candidate.name);
  const extension = sanitizedName ? getExtension(sanitizedName) : "";
  const allowedExtensions = allowedTypes.get(candidate.mimeType);

  if (!sanitizedName || sanitizedName === "." || sanitizedName === "..") {
    reasons.push("File name is missing or invalid.");
  }

  if (candidate.name.includes("..") || candidate.name.includes("/") || candidate.name.includes("\\")) {
    reasons.push("File name cannot include folders or path traversal.");
  }

  if (!Number.isSafeInteger(candidate.sizeBytes) || candidate.sizeBytes <= 0) {
    reasons.push("File size must be greater than zero.");
  }

  if (candidate.sizeBytes > MAX_UPLOAD_SIZE_BYTES) {
    reasons.push("File is larger than the 100 MB MVP limit.");
  }

  if (!allowedExtensions) {
    reasons.push("File type is not allowed.");
  } else if (!allowedExtensions.has(extension)) {
    reasons.push("File extension does not match the declared MIME type.");
  }

  if (reasons.length > 0) {
    return { allowed: false, reasons };
  }

  return {
    allowed: true,
    sanitizedName: sanitizedName as string,
    extension,
    mimeType: candidate.mimeType,
    sizeBytes: candidate.sizeBytes,
  };
}

export function getAllowedUploadTypes() {
  return Array.from(allowedTypes.entries()).map(([mimeType, extensions]) => ({
    mimeType,
    extensions: Array.from(extensions),
  }));
}
