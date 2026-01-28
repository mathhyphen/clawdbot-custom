import { IncomingMessage, ServerResponse } from "node:http";
import { loadConfig } from "../config/config.js";
import { RuntimeEnv } from "../runtime.js";
import { resolveFeishuAccount } from "./accounts.js";
import { normalizeFeishuWebhookPath, FeishuHttpHandler } from "./http.js";
import { FeishuCipher } from "./crypto.js";
import { FeishuClient } from "./client.js";
import { convertFeishuMessage } from "./convert.js";

// Core AI Imports - Corrected Paths
import { finalizeInboundContext } from "../auto-reply/reply/inbound-context.js";
import { dispatchReplyWithBufferedBlockDispatcher } from "../auto-reply/reply/provider-dispatcher.js";
import { formatInboundEnvelope, resolveEnvelopeFormatOptions } from "../auto-reply/envelope.js";
import { resolveAgentRoute } from "../routing/resolve-route.js";

export type MonitorFeishuOpts = {
  accountId?: string;
  config?: any;
  runtime?: RuntimeEnv;
  abortSignal?: AbortSignal;
};

export function createFeishuHandler(opts: MonitorFeishuOpts): FeishuHttpHandler {
  const cfg = opts.config ?? loadConfig();
  const account = resolveFeishuAccount({ cfg, accountId: opts.accountId });
  const runtime = opts.runtime ?? (console as any);
  
  if (!account.config.appId || !account.config.appSecret) {
    return async () => false;
  }

  const client = new FeishuClient(account.config.appId!, account.config.appSecret!);
  const cipher = account.config.encryptKey ? new FeishuCipher(account.config.encryptKey) : null;
  const webhookPath = normalizeFeishuWebhookPath(account.config.webhookPath);

  return async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const incomingPath = url.pathname.replace(/\/$/, "");
    const expectedPath = webhookPath.replace(/\/$/, "");
    
    if (incomingPath !== expectedPath) {
      return false;
    }

    // console.log(`[Feishu] Received request on ${incomingPath}`);

    let body = "";
    try {
      await new Promise<void>((resolve, reject) => {
        req.on("data", (chunk) => (body += chunk));
        req.on("end", resolve);
        req.on("error", reject);
      });
    } catch (err) {
      runtime.error?.(`[Feishu] Error reading request body: ${String(err)}`);
      return false;
    }

    if (!body) {
      res.writeHead(400);
      res.end("empty_body");
      return true;
    }

    try {
      const rawData = JSON.parse(body);
      let payload = rawData;

      if (rawData.encrypt) {
        if (!cipher) throw new Error("Missing encryptKey");
        payload = JSON.parse(cipher.decrypt(rawData.encrypt));
      }
      
      // console.log(`[Feishu] Payload type: ${payload.type || payload.header?.event_type}`);

      if (payload.type === "url_verification") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ challenge: payload.challenge }));
        return true;
      }

      // 3. Handle Events (v2.0)
      if (payload.schema === "2.0" && payload.header?.event_type === "im.message.receive_v1") {
        const msg = convertFeishuMessage(payload);
        
        if (msg.text) {
          runtime.log?.(`[Feishu] Message from ${msg.senderName}: ${msg.text.substring(0, 50)}...`); // Keep a simple log
          
          // 1. Resolve Route
          const route = resolveAgentRoute({
            cfg,
            channel: "feishu",
            accountId: account.accountId,
            peer: { 
              kind: msg.isGroup ? "group" : "dm", 
              id: msg.chatId 
            },
          });

          // 2. Build Envelope
          const envelopeOptions = resolveEnvelopeFormatOptions(cfg);
          const bodyText = formatInboundEnvelope({
            channel: "Feishu",
            from: msg.senderName,
            body: msg.text,
            envelope: envelopeOptions,
          });

          // 3. Build Context
          const ctx = finalizeInboundContext({
            Body: bodyText,
            RawBody: msg.text,
            From: `feishu:${msg.senderId}`,
            To: `feishu:${msg.chatId}`,
            SessionKey: route.sessionKey,
            AccountId: route.accountId,
            ChatType: msg.isGroup ? "channel" : "direct",
            SenderName: msg.senderName,
            Provider: "feishu",
          });

          // 4. Dispatch to Agent
          dispatchReplyWithBufferedBlockDispatcher({
            ctx,
            cfg,
            dispatcherOptions: {
              deliver: async (replyPayload) => {
                let finalText = replyPayload.text || "";
                
                // CLEANUP: If the text looks like a raw JSON object (common with reasoning models), try to extract just the text.
                if (finalText.trim().startsWith("{") && finalText.includes('"text":')) {
                  try {
                    const parsed = JSON.parse(finalText);
                    if (parsed.content && Array.isArray(parsed.content)) {
                      finalText = parsed.content.map((c: any) => c.text).join("");
                    } else if (parsed.text) {
                      finalText = parsed.text;
                    }
                  } catch {}
                }

                if (finalText) {
                  await client.sendMessage({
                    receive_id: msg.chatId,
                    receive_id_type: "chat_id",
                    msg_type: "text",
                    content: JSON.stringify({ text: finalText }),
                  });
                }
              },
              onError: (err) => {
                runtime.error?.(`[Feishu] AI Reply Error: ${String(err)}`);
              }
            },
          });
        }
      }

      res.writeHead(200);
      res.end("ok");
    } catch (err) {
      runtime.error?.(`Feishu error: ${String(err)}`);
      res.writeHead(500);
      res.end("error");
    }
    return true;
  };
}

export async function monitorFeishuProvider(opts: MonitorFeishuOpts = {}) {
}