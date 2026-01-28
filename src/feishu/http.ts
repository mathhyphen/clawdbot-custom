import crypto from "node:crypto";
import { IncomingMessage, ServerResponse } from "node:http";

export function normalizeFeishuWebhookPath(path?: string): string {
  if (!path) return "/feishu/events";
  return path.startsWith("/") ? path : `/${path}`;
}

export function verifyFeishuSignature(opts: {
  timestamp: string;
  nonce: string;
  encryptKey: string;
  body: string;
  signature: string;
}): boolean {
  const { timestamp, nonce, encryptKey, body, signature } = opts;
  const content = timestamp + nonce + encryptKey + body;
  const hash = crypto.createHash("sha256").update(content).digest("hex");
  return hash === signature;
}

// Handler definition that matches Clawdbot's plugin HTTP handler signature
export type FeishuHttpHandler = (req: IncomingMessage, res: ServerResponse) => Promise<boolean>;