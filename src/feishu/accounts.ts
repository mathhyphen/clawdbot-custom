import { ClawdbotConfig, loadConfig } from "../config/config.js";
import { FeishuAccountConfig, FeishuConfig } from "../config/types.feishu.js";

export type FeishuAccount = {
  accountId: string;
  config: FeishuAccountConfig;
};

export function listEnabledFeishuAccounts(cfg: ClawdbotConfig = loadConfig()): FeishuAccount[] {
  const feishuCfg = cfg.channels?.feishu as FeishuConfig | undefined;
  if (!feishuCfg || feishuCfg.enabled === false) return [];

  const accounts: FeishuAccount[] = [];
  
  // Add default account if enabled
  if (feishuCfg.appId) {
    accounts.push({
      accountId: "default",
      config: feishuCfg,
    });
  }

  // Add sub-accounts
  if (feishuCfg.accounts) {
    for (const [id, accCfg] of Object.entries(feishuCfg.accounts)) {
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

export function resolveFeishuAccount(opts: {
  cfg?: ClawdbotConfig;
  accountId?: string;
}): FeishuAccount {
  const cfg = opts.cfg ?? loadConfig();
  const feishuCfg = (cfg.channels?.feishu ?? {}) as FeishuConfig;
  const accountId = opts.accountId ?? "default";

  if (accountId === "default") {
    return { accountId: "default", config: feishuCfg };
  }

  const accCfg = feishuCfg.accounts?.[accountId];
  if (!accCfg) {
    throw new Error(`Feishu account "${accountId}" not found in config.`);
  }

  return { accountId, config: accCfg };
}
