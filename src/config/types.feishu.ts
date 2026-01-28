import { ChannelDefaultsConfig, ChannelHeartbeatVisibilityConfig } from "./types.channels.js";
import {
  BlockStreamingChunkConfig,
  BlockStreamingCoalesceConfig,
  DmPolicy,
  GroupPolicy,
  MarkdownConfig,
  OutboundRetryConfig,
} from "./types.base.js";
import { DmConfig, ProviderCommandsConfig } from "./types.messages.js";

export type FeishuAccountConfig = {
  name?: string;
  enabled?: boolean;
  capabilities?: string[];
  markdown?: MarkdownConfig;
  configWrites?: boolean;
  
  // Feishu API credentials
  appId?: string;
  appSecret?: string;
  encryptKey?: string;
  verificationToken?: string;
  
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

export type FeishuConfig = FeishuAccountConfig & {
  accounts?: Record<string, FeishuAccountConfig>;
};