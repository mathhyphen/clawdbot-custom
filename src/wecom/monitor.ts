import { IncomingMessage, ServerResponse } from "node:http";
import { loadConfig } from "../config/config.js";
import { RuntimeEnv } from "../runtime.js";
import { resolveWeComAccount } from "./accounts.js";
import { normalizeWeComWebhookPath, WeComHttpHandler } from "./http.js";

export type MonitorWeComOpts = {
  accountId?: string;
  config?: any;
  runtime?: RuntimeEnv;
  abortSignal?: AbortSignal;
};

export function createWeComHandler(opts: MonitorWeComOpts): WeComHttpHandler {
  const cfg = opts.config ?? loadConfig();
  const account = resolveWeComAccount({ cfg, accountId: opts.accountId });
  const webhookPath = normalizeWeComWebhookPath(account.config.webhookPath);

  return async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (url.pathname !== webhookPath) return false;
    
    // WeCom logic
    res.writeHead(200);
    res.end("ok");
    return true;
  };
}

export async function monitorWeComProvider(opts: MonitorWeComOpts = {}) {
}