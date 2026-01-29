# 🦞 Clawdbot — 个人AI助手（中文版）

<p align="center">
  <img src="https://raw.githubusercontent.com/clawdbot/clawdbot/main/docs/whatsapp-clawd.jpg" alt="Clawdbot" width="400">
</p>

<p align="center">
  <strong>EXFOLIATE! EXFOLIATE!</strong>
</p>

<p align="center">
  <a href="https://github.com/mathhyphen/clawdbot-custom/actions/workflows/ci.yml?branch=main"><img src="https://img.shields.io/github/actions/workflow/status/mathhyphen/clawdbot-custom/ci.yml?branch=main&style=for-the-badge" alt="CI status"></a>
  <a href="https://github.com/mathhyphen/clawdbot-custom/releases"><img src="https://img.shields.io/github/v/release/mathhyphen/clawdbot-custom?include_prereleases&style=for-the-badge" alt="GitHub release"></a>
  <a href="https://discord.gg/clawd"><img src="https://img.shields.io/discord/1456350064065904867?label=Discord&logo=discord&logoColor=white&color=5865F2&style=for-the-badge" alt="Discord"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
</p>

**Clawdbot** 是一个你可以在自己设备上运行的**个人AI助手**。它可以在你已经使用的通讯软件上回复你（WhatsApp、Telegram、Slack、Discord、Google Chat、Signal、iMessage、Microsoft Teams、WebChat），以及扩展通道如BlueBubbles、Matrix、Zalo等。它可以在macOS/iOS/Android上说话和倾听，并且可以渲染一个你控制的实时Canvas。

如果你想要一个个人、单用户的助手，感觉本地、快速、随时在线，这就是它。

## 国内特色功能

- **飞书通讯集成**：支持飞书消息收发
- **智谱GLM Code Planing**：支持智谱的代码规划模型
- **国内模型优化**：针对国内网络环境优化
- **中文文档**：详细的中文安装和配置指南

## 系统要求

- **Node.js**：≥ 22.12.0
- **包管理器**：npm、pnpm 或 bun
- **操作系统**：macOS、Linux 或 Windows (推荐通过 WSL2)
- **网络**：需要访问互联网（国内用户可能需要配置网络环境）

## 安装方法

### 方法一：从源码安装（推荐）

1. **克隆仓库**：
   ```bash
   git clone https://github.com/mathhyphen/clawdbot-custom.git
   cd clawdbot-custom
   ```

2. **安装依赖**：
   ```bash
   pnpm install
   ```

3. **构建项目**：
   ```bash
   pnpm build
   pnpm ui:build
   ```

4. **运行初始化向导**：
   ```bash
   pnpm clawdbot onboard --install-daemon
   ```

### 方法二：从发布包安装

1. **下载发布包**：
   从 GitHub Releases 页面下载最新的发布包

2. **安装发布包**：
   ```bash
   npm install -g ./clawdbot-*.tgz
   ```

3. **运行初始化向导**：
   ```bash
   clawdbot onboard --install-daemon
   ```

## 配置指南

### 飞书通讯配置

1. **在飞书开发者平台创建应用**：
   - 访问 [飞书开发者平台](https://open.feishu.cn/)
   - 创建一个企业自建应用
   - 获取 `appId`、`appSecret`、`encryptKey`、`verificationToken`

2. **配置应用权限**：
   - 启用「机器人」能力
   - 添加「消息通知」权限
   - 配置事件订阅

3. **更新配置文件**：
   复制 `config.template.cn.json` 到 `~/.clawdbot/clawdbot.json` 并填写飞书配置：
   ```json
   {
     "channels": {
       "feishu": {
         "appId": "your_feishu_app_id",
         "appSecret": "your_feishu_app_secret",
         "encryptKey": "your_feishu_encrypt_key",
         "verificationToken": "your_feishu_verification_token",
         "webhookPath": "/webhook/feishu",
         "dmPolicy": "pairing",
         "allowFrom": ["*"]
       }
     }
   }
   ```

4. **启动网关**：
   ```bash
   pnpm clawdbot gateway
   ```

5. **配置飞书事件订阅**：
   - 在飞书开发者平台配置事件订阅
   - 回调地址设置为：`http://your-server/webhook/feishu`
   - 验证令牌使用你配置的 `verificationToken`

### 智谱GLM Code Planing配置

1. **获取智谱API Key**：
   - 访问 [智谱开放平台](https://open.bigmodel.cn/)
   - 创建应用并获取 API Key

2. **更新配置文件**：
   在 `~/.clawdbot/clawdbot.json` 中添加智谱配置：
   ```json
   {
     "agents": {
       "defaults": {
         "model": { "primary": "zhipu/code-planning" }
       }
     },
     "models": {
       "providers": {
         "zhipu": {
           "baseUrl": "https://open.bigmodel.cn/api/coding/paas/v4",
           "apiKey": "your_zhipu_api_key",
           "api": "openai-completions"
         }
       }
     }
   }
   ```

3. **设置环境变量**（可选）：
   ```bash
   export ZHIPU_API_KEY="your_zhipu_api_key"
   ```

4. **测试智谱模型**：
   ```bash
   pnpm clawdbot agent --message "写一个简单的Python函数来计算斐波那契数列"
   ```

## 多模型配置

你可以同时配置多个模型，根据需要切换使用：

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "zhipu/code-planning",
        "fallback": ["openai/gpt-5.2", "anthropic/claude-opus-4-5"]
      },
      "models": {
        "zhipu/code-planning": { "alias": "GLM Code" },
        "openai/gpt-5.2": { "alias": "GPT-5" },
        "anthropic/claude-opus-4-5": { "alias": "Claude" }
      }
    }
  }
}
```

## 常用命令

- **启动网关**：
  ```bash
  pnpm clawdbot gateway --port 18789 --verbose
  ```

- **发送消息**：
  ```bash
  pnpm clawdbot message send --to +1234567890 --message "Hello from Clawdbot"
  ```

- **与助手对话**：
  ```bash
  pnpm clawdbot agent --message "帮我写一个Dockerfile"
  ```

- **切换模型**：
  在聊天中发送 `/model GLM Code`

- **查看状态**：
  在聊天中发送 `/status`

## 常见问题

### 1. 飞书消息接收不到
- **检查**：确认飞书应用配置正确
- **验证**：检查webhook地址是否可访问
- **测试**：使用飞书开发者工具测试事件推送

### 2. 智谱API调用失败
- **检查**：确认API Key正确
- **验证**：检查网络连接是否正常
- **测试**：使用curl测试API调用

### 3. 模型切换不生效
- **检查**：确认模型配置正确
- **验证**：使用 `clawdbot models list` 查看可用模型
- **测试**：重启网关后再次尝试

### 4. 安装依赖失败
- **检查**：确认Node.js版本≥22.12.0
- **验证**：尝试使用不同的包管理器
- **测试**：清理缓存后重新安装

## 故障排查

### 查看日志
```bash
pnpm clawdbot logs
```

### 运行诊断
```bash
pnpm clawdbot doctor
```

### 重启网关
```bash
pnpm clawdbot gateway --restart
```

### 重置配置
```bash
pnpm clawdbot reset
```

## 国内网络优化

### 配置代理
```bash
export HTTP_PROXY=http://your-proxy:port
export HTTPS_PROXY=http://your-proxy:port
pnpm clawdbot gateway
```

### 使用国内镜像
```bash
npm config set registry https://registry.npmmirror.com/
pnpm config set registry https://registry.npmmirror.com/
```

## 更新方法

### 从源码更新
```bash
git pull origin main
pnpm install
pnpm build
pnpm clawdbot restart
```

### 从发布包更新
```bash
# 下载新版本
npm install -g ./clawdbot-*.tgz
clawdbot restart
```

## 安全注意事项

1. **API Key保护**：不要将API Key提交到版本控制
2. **配置文件安全**：`~/.clawdbot/clawdbot.json` 包含敏感信息，请妥善保管
3. **网络安全**：避免在公共网络上暴露网关
4. **权限控制**：合理配置飞书和其他通道的访问权限

## 贡献指南

欢迎贡献代码和改进！请参考：
- [CONTRIBUTING.md](CONTRIBUTING.md)
- 提交Issue报告问题
- 提交Pull Request改进功能

## 许可证

本项目使用MIT许可证。详见 [LICENSE](LICENSE) 文件。

## 鸣谢

特别感谢 [Peter Steinberger](https://steipete.me) 和社区贡献者们，以及 [Mario Zechner](https://mariozechner.at/) 对 [pi-mono](https://github.com/badlogic/pi-mono) 的支持。

---

**Clawdbot** - 你的个人AI助手，随时为你服务！ 🦞