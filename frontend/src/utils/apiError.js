export function getApiError(err, fallback = "Une erreur est survenue.") {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.error) return String(data.error);
  if (data.detail) {
    return Array.isArray(data.detail) ? data.detail.join(" ") : String(data.detail);
  }
  const parts = [];
  for (const [key, val] of Object.entries(data)) {
    if (Array.isArray(val)) parts.push(`${key}: ${val.join(", ")}`);
    else if (typeof val === "string") parts.push(`${key}: ${val}`);
  }
  return parts.length ? parts.join("\n") : fallback;
}

export const API_ORIGIN =
  (import.meta.env.VITE_APP_API_URL || "").replace(/\/api\/?$/, "") ||
  "http://127.0.0.1:8000";

export function getMediaUrl(imageField) {
  if (!imageField) return "";
  const s = String(imageField);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const path = s.startsWith("/") ? s : `/${s}`;
  return `${API_ORIGIN}${path}`;
}

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260'%3E%3Crect fill='%231a2a44' width='400' height='260'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23c9a227' font-size='48'%3E🏠%3C/text%3E%3C/svg%3E";
