import { customAlphabet } from "nanoid";

const unambiguousAlphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export const createPublicEpisodeId = customAlphabet(unambiguousAlphabet, 10);

export function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
}

export function isValidUsername(value: string) {
  return /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/.test(value);
}
