# Feishu (Lark) Channel Plugin

This plugin integrates **Feishu (Lark)** messaging with OpenClaw, allowing you to use Feishu as a chat interface for your AI assistant.

## Features

- **Receive Messages**: Listens for messages from Feishu users via Webhook (V2 event format).
- **Auto-Reply**: Automatically replies to users using the configured Agent/Model.
- **Secure**: Supports Feishu's AES encryption (`encryptKey`) and token verification (`verificationToken`).
- **Policy Control**: Configure who can talk to the bot via `dmPolicy` and `allowFrom`.

## Setup Guide

### 1. Create a Feishu App

1. Go to the [Feishu Open Platform](https://open.feishu.cn/app) (or Lark Open Platform).
2. Create a specific app (企业自建应用).
3. In **Credentials & Basic Info**, get your `App ID` and `App Secret`.

### 2. Configure Permissions

Enable the following permissions in **Permissions & Scopes**:
- `im:message` (Access messages)
- `im:message.p2p_msg` (Read private messages)
- `im:message.p2p_msg:readonly`
- `im:message:send_as_bot` (Send messages as bot)

*Remember to create a version and release the app for permissions to take effect.*

### 3. Configure Event Subscription (Webhook)

1. Go to **Event Subscriptions**.
2. Set the **Request URL** to your OpenClaw Gateway address:
   - Example: `https://your-tailscale-domain.ts.net/feishu/events`
   - *Note: You must use a public URL (like Tailscale Funnel) or a tunnel.*
3. Set an **Encrypt Key** (recommended).
4. Get the **Verification Token**.
5. Add the event type: **Receive Message** (`im.message.receive_v1`).

### 4. Configure OpenClaw

Add the following to your `~/.openclaw/openclaw.json` (or `moltbot.json`):

```json
{
  "channels": {
    "feishu": {
      "enabled": true,
      "appId": "cli_xxxxxxxx",
      "appSecret": "your_app_secret",
      "encryptKey": "your_encrypt_key",
      "verificationToken": "your_verification_token",
      "webhookPath": "/feishu/events",
      "dmPolicy": "open"
    }
  },
  "plugins": {
    "allow": ["feishu"]
  }
}
```

## Usage

- **Direct Message**: Just send a message to your bot in Feishu.
- **Group Chat**: Add the bot to a group. Mention the bot (`@BotName`) to talk to it (if `groupPolicy` is `allowlist` or `open`).

## Troubleshooting

- **400 Bad Request**: Check if `encryptKey` matches the one in Feishu console.
- **No Reply**: Check OpenClaw logs for `[Feishu Plugin]` entries. Ensure the bot has `im:message:send_as_bot` permission.
