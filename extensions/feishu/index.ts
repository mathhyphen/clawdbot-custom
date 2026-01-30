import type { MoltbotPluginApi } from "clawdbot/plugin-sdk";
import { emptyPluginConfigSchema } from "clawdbot/plugin-sdk";

import { feishuPlugin } from "./src/channel.js";
import { setFeishuRuntime } from "./src/runtime.js";
import { registerFeishuWebhook } from "./src/monitor.js";

const plugin = {
  id: "feishu",
  name: "Feishu (Lark)",
  description: "Feishu/Lark messaging integration",
  configSchema: emptyPluginConfigSchema(),
  register(api: MoltbotPluginApi) {
    setFeishuRuntime(api.runtime);
    api.registerChannel({ plugin: feishuPlugin });
    registerFeishuWebhook(api);
  },
};

export default plugin;
