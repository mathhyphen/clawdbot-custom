import { ChannelDefaultsConfig, ChannelHeartbeatVisibilityConfig } from "./types.channels.js";
import {
  BlockStreamingChunkConfig,
  BlockStreamingCoalesceConfig,
  DmPolicy,
  GroupPolicy,
  MarkdownConfig,
  OutboundRetryConfig,
} from "./types.base.js";
import { DmConfig } from "./types.messages.js";

export type WeComAccountConfig = {
  name?: string;
  enabled?: boolean;
  capabilities?: string[];
  markdown?: MarkdownConfig;
  configWrites?: boolean;
  
  // WeCom API credentials
  corpId?: string;
  agentId?: string;
  secret?: string;
  token?: string;
  encodingAesKey?: string;
  
  // Webhook settings
  webhookPath?: string;
  
  // Policies
  dmPolicy?: DmPolicy;
  allowFrom?: (string | number)[];
  groupPolicy?: GroupPolicy;
  groupAllowFrom?: (string | number)[];
  
  // History & Streaming
  historyLimit?: number;
  dmHistoryLimit?: number;
  dms?: Record<string, DmConfig>;
  textChunkLimit?: number;
  chunkMode?: "length" | "newline";
  blockStreaming?: boolean;
  blockStreamingCoalesce?: BlockStreamingCoalesceConfig;
  
  // Media
  mediaMaxMb?: number;
  
  // Retry
  retry?: OutboundRetryConfig;
  
  // Heartbeat
  heartbeat?: ChannelHeartbeatVisibilityConfig;
};

export type WeComConfig = WeComAccountConfig & {
  accounts?: Record<string, WeComAccountConfig>;
};