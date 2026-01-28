import { z } from "zod";
import {
  BlockStreamingCoalesceSchema,
  DmConfigSchema,
  DmPolicySchema,
  GroupPolicySchema,
  MarkdownConfigSchema,
  RetryConfigSchema,
  requireOpenAllowFrom,
} from "./zod-schema.core.js";
import { ChannelHeartbeatVisibilitySchema } from "./zod-schema.channels.js";

export const WeComAccountSchemaBase = z
  .object({
    name: z.string().optional(),
    enabled: z.boolean().optional(),
    capabilities: z.array(z.string()).optional(),
    markdown: MarkdownConfigSchema,
    configWrites: z.boolean().optional(),
    
    corpId: z.string().optional(),
    agentId: z.string().optional(),
    secret: z.string().optional(),
    token: z.string().optional(),
    encodingAesKey: z.string().optional(),
    
    webhookPath: z.string().optional(),
    
    dmPolicy: DmPolicySchema.optional().default("pairing"),
    allowFrom: z.array(z.union([z.string(), z.number()])).optional(),
    groupPolicy: GroupPolicySchema.optional().default("allowlist"),
    groupAllowFrom: z.array(z.union([z.string(), z.number()])).optional(),
    
    historyLimit: z.number().int().min(0).optional(),
    dmHistoryLimit: z.number().int().min(0).optional(),
    dms: z.record(z.string(), DmConfigSchema.optional()).optional(),
    
    textChunkLimit: z.number().int().positive().optional(),
    chunkMode: z.enum(["length", "newline"]).optional(),
    blockStreaming: z.boolean().optional(),
    blockStreamingCoalesce: BlockStreamingCoalesceSchema.optional(),
    
    mediaMaxMb: z.number().positive().optional(),
    retry: RetryConfigSchema,
    heartbeat: ChannelHeartbeatVisibilitySchema,
  })
  .strict();

export const WeComAccountSchema = WeComAccountSchemaBase.superRefine((value, ctx) => {
  requireOpenAllowFrom({
    policy: value.dmPolicy,
    allowFrom: value.allowFrom,
    ctx,
    path: ["allowFrom"],
    message: 'channels.wecom.dmPolicy="open" requires channels.wecom.allowFrom to include "*"',
  });
});

export const WeComConfigSchema = WeComAccountSchemaBase.extend({
  accounts: z.record(z.string(), WeComAccountSchema.optional()).optional(),
}).superRefine((value, ctx) => {
  requireOpenAllowFrom({
    policy: value.dmPolicy,
    allowFrom: value.allowFrom,
    ctx,
    path: ["allowFrom"],
    message: 'channels.wecom.dmPolicy="open" requires channels.wecom.allowFrom to include "*"',
  });
});
