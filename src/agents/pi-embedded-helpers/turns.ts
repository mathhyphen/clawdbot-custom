import type { AgentMessage } from "@mariozechner/pi-agent-core";

/**
 * Validates and fixes conversation turn sequences for Gemini API.
 * Gemini requires strict alternating user→assistant→tool→user pattern.
 * Merges consecutive assistant messages together.
 */
export function validateGeminiTurns(messages: AgentMessage[]): AgentMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) {
    return messages;
  }

  const result: AgentMessage[] = [];
  let lastRole: string | undefined;

  for (const msg of messages) {
    if (!msg || typeof msg !== "object") {
      result.push(msg);
      continue;
    }

    const msgRole = (msg as { role?: unknown }).role as string | undefined;
    if (!msgRole) {
      result.push(msg);
      continue;
    }

    if (msgRole === lastRole && lastRole === "assistant") {
      const lastMsg = result[result.length - 1];
      const currentMsg = msg as Extract<AgentMessage, { role: "assistant" }>;

      if (lastMsg && typeof lastMsg === "object") {
        const lastAsst = lastMsg as Extract<AgentMessage, { role: "assistant" }>;
        const mergedContent = [
          ...(Array.isArray(lastAsst.content) ? lastAsst.content : []),
          ...(Array.isArray(currentMsg.content) ? currentMsg.content : []),
        ];

        const merged: Extract<AgentMessage, { role: "assistant" }> = {
          ...lastAsst,
          content: mergedContent,
          ...(currentMsg.usage && { usage: currentMsg.usage }),
          ...(currentMsg.stopReason && { stopReason: currentMsg.stopReason }),
          ...(currentMsg.errorMessage && {
            errorMessage: currentMsg.errorMessage,
          }),
        };

        result[result.length - 1] = merged;
        continue;
      }
    }

    result.push(msg);
    lastRole = msgRole;
  }

  return result;
}

/**
 * Merges system and developer messages into the first following user message.
 * This is used for models that do not support system/developer roles (like Zhipu Coding Plan).
 */
export function mergeSystemIntoUserTurns(messages: AgentMessage[]): AgentMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) {
    return messages;
  }

  const result: AgentMessage[] = [];
  let pendingSystemContent: any[] = [];

  for (const msg of messages) {
    if (!msg || typeof msg !== "object") {
      result.push(msg);
      continue;
    }

    const role = (msg as any).role;

    if (role === "system" || role === "developer") {
      const content = (msg as any).content;
      if (Array.isArray(content)) {
        pendingSystemContent.push(...content);
      } else if (typeof content === "string") {
        pendingSystemContent.push({ type: "text", text: content });
      }
      continue;
    }

    if (role === "user") {
      if (pendingSystemContent.length > 0) {
        const userMsg = msg as Extract<AgentMessage, { role: "user" }>;
        const originalContent = Array.isArray(userMsg.content)
          ? userMsg.content
          : [{ type: "text", text: userMsg.content }];

        // Prepend system content to user content
        const mergedContent = [...pendingSystemContent, ...originalContent];
        result.push({ ...userMsg, content: mergedContent } as AgentMessage);
        pendingSystemContent = [];
      } else {
        result.push(msg);
      }
      continue;
    }

    // For assistant or tool messages, if we have pending system content, 
    // we must prepend it to a user message. If we haven't seen a user message yet,
    // we might need to create one, but usually system comes before first user.
    if (pendingSystemContent.length > 0 && result.length === 0) {
        // If we have system content but no messages yet, and this isn't a user message,
        // create a dummy user message to hold the system content.
        result.push({
            role: "user",
            content: pendingSystemContent,
        } as AgentMessage);
        pendingSystemContent = [];
    }

    result.push(msg);
  }

  // If there's still pending system content at the end
  if (pendingSystemContent.length > 0) {
      if (result.length > 0 && result[result.length - 1].role === "user") {
          const lastUser = result[result.length - 1] as Extract<AgentMessage, { role: "user" }>;
          lastUser.content = [
              ...(Array.isArray(lastUser.content) ? lastUser.content : []),
              ...pendingSystemContent
          ];
      } else {
          result.push({
              role: "user",
              content: pendingSystemContent,
          } as AgentMessage);
      }
  }

  return result;
}

export function mergeConsecutiveUserTurns(
  previous: Extract<AgentMessage, { role: "user" }>,
  current: Extract<AgentMessage, { role: "user" }>,
): Extract<AgentMessage, { role: "user" }> {
  const mergedContent = [
    ...(Array.isArray(previous.content) ? previous.content : []),
    ...(Array.isArray(current.content) ? current.content : []),
  ];

  return {
    ...current,
    content: mergedContent,
    timestamp: current.timestamp ?? previous.timestamp,
  };
}

/**
 * Validates and fixes conversation turn sequences for Anthropic API.
 * Anthropic requires strict alternating user→assistant pattern.
 * Merges consecutive user messages together.
 */
export function validateAnthropicTurns(messages: AgentMessage[]): AgentMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) {
    return messages;
  }

  const result: AgentMessage[] = [];
  let lastRole: string | undefined;

  for (const msg of messages) {
    if (!msg || typeof msg !== "object") {
      result.push(msg);
      continue;
    }

    const msgRole = (msg as { role?: unknown }).role as string | undefined;
    if (!msgRole) {
      result.push(msg);
      continue;
    }

    if (msgRole === lastRole && lastRole === "user") {
      const lastMsg = result[result.length - 1];
      const currentMsg = msg as Extract<AgentMessage, { role: "user" }>;

      if (lastMsg && typeof lastMsg === "object") {
        const lastUser = lastMsg as Extract<AgentMessage, { role: "user" }>;
        const merged = mergeConsecutiveUserTurns(lastUser, currentMsg);
        result[result.length - 1] = merged;
        continue;
      }
    }

    result.push(msg);
    lastRole = msgRole;
  }

  return result;
}
