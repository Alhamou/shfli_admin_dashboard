// Small pure helpers for the send-notification dialog.

export type LinkTarget =
  | { kind: "none" }
  | { kind: "ad"; uuid: string }
  | { kind: "link"; url: string }
  | { kind: "invalid" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHFLI_HOSTS = ["shfli.com", "www.shfli.com"];

/** One field for "what opens on tap": a Shfli ad link (or its uuid) opens the ad in the app, any other https link opens in the browser. */
export function parseLinkTarget(raw: string): LinkTarget {
  const v = raw.trim();
  if (!v) return { kind: "none" };
  if (UUID_RE.test(v)) return { kind: "ad", uuid: v.toLowerCase() };
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
  } catch {
    return { kind: "invalid" };
  }
  if (!url.hostname.includes(".")) return { kind: "invalid" };
  if (SHFLI_HOSTS.includes(url.hostname.toLowerCase()) && url.pathname.startsWith("/items/details")) {
    const uuid = url.searchParams.get("uuid")?.trim();
    if (uuid && UUID_RE.test(uuid)) return { kind: "ad", uuid: uuid.toLowerCase() };
    return { kind: "invalid" };
  }
  return { kind: "link", url: url.toString() };
}

export const adLink = (uuid: string) => `https://www.shfli.com/items/details?uuid=${uuid}`;

/**
 * Size saved with the picture. The old app draws the picture at exactly width x height, so keep it about
 * 300 wide; the new apps only use the ratio.
 */
export function displaySize(width: number, height: number, max = 300) {
  const w = Math.min(max, width);
  return { width: w, height: Math.max(1, Math.round((height * w) / width)) };
}

/**
 * Shrinks a picture in the browser (JPEG, longest side <= max) so the upload is small and the size is known.
 * Stays under ~900 KB: team.shfli.com (nginx) refuses request bodies over 1 MB.
 */
export async function shrinkImage(file: File, max = 1600, maxBytes = 900_000): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    let result: { blob: Blob; width: number; height: number } | null = null;
    for (const side of [max, 1280, 1024]) {
      const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
      const width = Math.round(bitmap.width * scale);
      const height = Math.round(bitmap.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no canvas");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(bitmap, 0, 0, width, height);
      for (const quality of [0.88, 0.8, 0.7]) {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
        if (!blob) throw new Error("encode failed");
        result = { blob, width, height };
        if (blob.size <= maxBytes) return result;
      }
    }
    if (!result || result.blob.size > maxBytes) throw new Error("image too large");
    return result;
  } finally {
    bitmap.close?.();
  }
}
