import { emptyPluginConfigSchema } from "clawdbot/plugin-sdk";
import { 
  createFeishuHandler, 
  listEnabledFeishuAccounts, 
  resolveFeishuAccount 
} from "../../src/feishu/index.js";

const feishuPlugin = {
  id: "feishu",
  name: "Feishu",
  description: "Feishu/Lark integration",
  meta: {
    label: "Feishu",
    systemImage: "message",
  },
  configSchema: emptyPluginConfigSchema(),
  register(api) {
    const feishuDock = {
      id: "feishu",
      capabilities: {
        chatTypes: ["direct", "group"],
        reactions: true,
        media: true,
      },
      outbound: { textChunkLimit: 4000 },
    };

    api.registerChannel({
      plugin: {
        id: "feishu",
        meta: {
          label: "Feishu",
          systemImage: "message",
        },
        config: {
          listAccountIds: (cfg) => {
            const accounts = listEnabledFeishuAccounts(cfg);
            console.log(`[Feishu Plugin] listAccountIds found ${accounts.length} accounts.`);
            return accounts.map(acc => acc.accountId);
          },
          resolveAccount: (cfg, id) => resolveFeishuAccount({ cfg, accountId: id }).config,
        },
        gateway: {
          startAccount: async (opts) => {
            console.log(`[Feishu Plugin] startAccount for: ${opts.accountId}`);
            const handler = createFeishuHandler({
              accountId: opts.accountId,
              config: opts.cfg,
              runtime: opts.runtime,
              abortSignal: opts.abortSignal,
            });
            api.registerHttpHandler(handler);
            
            if (opts.abortSignal) {
              await new Promise<void>((resolve) => {
                opts.abortSignal.addEventListener("abort", () => resolve(), { once: true });
              });
            }
          }
        }
      },
      dock: feishuDock,
    });
  },
};

export default feishuPlugin;