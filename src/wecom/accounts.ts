import { ClawdbotConfig, loadConfig } from "../config/config.js";
import { WeComAccountConfig, WeComConfig } from "../config/types.wecom.js";

export type WeComAccount = {
  accountId: string;
  config: WeComAccountConfig;
};

export function listEnabledWeComAccounts(cfg: ClawdbotConfig = loadConfig()): WeComAccount[] {
  const wecomCfg = cfg.channels?.wecom as WeComConfig | undefined;
  if (!wecomCfg || wecomCfg.enabled === false) return [];

  const accounts: WeComAccount[] = [];
  
  if (wecomCfg.corpId) {
    accounts.push({
      accountId: "default",
      config: wecomCfg,
    });
  }

  if (wecomCfg.accounts) {
    for (const [id, accCfg] of Object.entries(wecomCfg.accounts)) {
      if (accCfg.enabled !== false) {
        accounts.push({
          accountId: id,
          config: accCfg,
        });
      }
    }
  }

  return accounts;
}

export function resolveWeComAccount(opts: {
  cfg?: ClawdbotConfig;
  accountId?: string;
}): WeComAccount {
  const cfg = opts.cfg ?? loadConfig();
  const wecomCfg = (cfg.channels?.wecom ?? {}) as WeComConfig;
  const accountId = opts.accountId ?? "default";

  if (accountId === "default") {
    return { accountId: "default", config: wecomCfg };
  }

  const accCfg = wecomCfg.accounts?.[accountId];
  if (!accCfg) {
    throw new Error(`WeCom account "${accountId}" not found in config.`);
  }

  return { accountId, config: accCfg };
}
