import { b64DecodeUnicode, encodeBase64 } from "@/utils/base64.utils";

const ROUTE_ID_VERSION = "v1";

function toBase64Url(input: string): string {
    return input
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function fromBase64Url(input: string): string {
    const normalized = input
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const padLength = (4 - (normalized.length % 4)) % 4;
    return normalized + "=".repeat(padLength);
}

export function encodeRouteId(scope: string, rawId: string): string {
    const payload = `${ROUTE_ID_VERSION}.${scope}.${rawId}`;
    return toBase64Url(encodeBase64(payload));
}

export function decodeRouteId(scope: string, encodedId: string): string | null {
    try {
        const decoded = b64DecodeUnicode(fromBase64Url(encodedId));
        const [version, decodedScope, ...rest] = decoded.split(".");
        if (version !== ROUTE_ID_VERSION || decodedScope !== scope || rest.length === 0) {
            return null;
        }
        const rawId = rest.join(".").trim();
        return rawId || null;
    } catch {
        return null;
    }
}