export interface DecodedAccessToken {
  sub: number;
  type: "user" | "admin";
  iat: number;
  exp: number;
}

/**
 * Decodes (does not verify — verification happens server-side) the JWT
 * payload, only to read `type` for UI branching (e.g. show admin nav).
 */
export function decodeAccessToken(token: string): DecodedAccessToken | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(payload)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json) as DecodedAccessToken;
  } catch {
    return null;
  }
}
