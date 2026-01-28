import { emptyPluginConfigSchema } from "clawdbot/plugin-sdk";
import { 
  createWeComHandler, 
  listEnabledWeComAccounts, 
  resolveWeComAccount 
} from "../../src/wecom/index.js";

const wecomPlugin = {
  id: "wecom",
  name: "WeCom",
  description: "WeCom integration",
  meta: {
    label: "WeCom",
    systemImage: "message",
  },
  configSchema: emptyPluginConfigSchema(),
  register(api) {
    const wecomDock = {
      id: "wecom",
      capabilities: {
        chatTypes: ["direct", "group"],
        reactions: true,
        media: true,
      },
      outbound: { textChunkLimit: 4000 },
    };

    api.registerChannel({
      plugin: {
        id: "wecom",
        meta: {
          label: "WeCom",
          systemImage: "message",
        },
        config: {
          listAccountIds: (cfg) => listEnabledWeComAccounts(cfg).map(acc => acc.accountId),
          resolveAccount: (cfg, id) => resolveWeComAccount({ cfg, accountId: id }).config,
        },
        gateway: {
          startAccount: async (opts) => {
            const handler = createWeComHandler({
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
      dock: wecomDock,
    });
  },
};

export default wecomPlugin;