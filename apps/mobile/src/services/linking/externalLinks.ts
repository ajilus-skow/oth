import { Linking } from "react-native";

export type ExternalLinkKind = "web" | "phone" | "email" | "map";

const allowedSchemes: Record<ExternalLinkKind, readonly string[]> = {
  web: ["https:"],
  phone: ["tel:"],
  email: ["mailto:"],
  map: ["https:", "maps:", "comgooglemaps:"]
};

export function validateExternalUrl(value: string, kind: ExternalLinkKind): URL | null {
  try {
    const url = new URL(value);
    if (!allowedSchemes[kind].includes(url.protocol)) return null;
    if ((kind === "web" || kind === "map") && url.protocol === "https:" && !url.hostname) return null;
    if ((kind === "phone" || kind === "email") && !url.pathname) return null;
    return url;
  } catch {
    return null;
  }
}

export async function openExternalUrl(
  value: string,
  kind: ExternalLinkKind
): Promise<{ ok: true } | { ok: false; message: string }> {
  const url = validateExternalUrl(value, kind);
  if (!url) return { ok: false, message: "This link is not available." };
  try {
    const canOpen = await Linking.canOpenURL(url.toString());
    if (!canOpen) return { ok: false, message: "This link cannot be opened on this device." };
    await Linking.openURL(url.toString());
    return { ok: true };
  } catch {
    return { ok: false, message: "Unable to open this link. Please try again." };
  }
}
