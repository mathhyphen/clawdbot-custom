import { IncomingMessage, ServerResponse } from "node:http";

export function normalizeWeComWebhookPath(path?: string): string {
  if (!path) return "/wecom/events";
  return path.startsWith("/") ? path : `/${path}`;
}

export type WeComHttpHandler = (req: IncomingMessage, res: ServerResponse) => Promise<boolean>;