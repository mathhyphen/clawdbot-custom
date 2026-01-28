import { fetch } from "undici";

const FEISHU_BASE_URL = "https://open.feishu.cn/open-apis";

export class FeishuClient {
  private token: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(
    private readonly appId: string,
    private readonly appSecret: string
  ) {}

  private async getAccessToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiresAt) {
      return this.token;
    }

    const res = await fetch(`${FEISHU_BASE_URL}/auth/v3/tenant_access_token/internal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: this.appId,
        app_secret: this.appSecret,
      }),
    });

    const data = (await res.json()) as any;
    if (data.code !== 0) {
      throw new Error(`Feishu auth failed: ${data.msg}`);
    }

    this.token = data.tenant_access_token;
    this.tokenExpiresAt = Date.now() + (data.expire - 300) * 1000; // Buffer 5 minutes
    return this.token!;
  }

  async sendMessage(opts: {
    receive_id: string;
    msg_type: "text" | "post" | "image" | "interactive";
    content?: string; // JSON string
    receive_id_type?: "open_id" | "user_id" | "chat_id" | "email";
  }) {
    const token = await this.getAccessToken();
    const receiveIdType = opts.receive_id_type ?? "open_id";

    const res = await fetch(
      `${FEISHU_BASE_URL}/im/v1/messages?receive_id_type=${receiveIdType}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receive_id: opts.receive_id,
          msg_type: opts.msg_type,
          content: opts.content,
        }),
      }
    );

    const data = (await res.json()) as any;
    if (data.code !== 0) {
      throw new Error(`Feishu send failed: ${data.msg}`);
    }
    return data.data;
  }
}
