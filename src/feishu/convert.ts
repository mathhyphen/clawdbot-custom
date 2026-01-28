export function convertFeishuMessage(payload: any) {
  const event = payload.event;
  const message = event.message;
  const sender = event.sender;

  // DEBUG RAW
  console.log("[Feishu Convert] Raw Message:", JSON.stringify(message).substring(0, 200));

  const isGroup = message.chat_type === "group";
  let text = "";

  try {
    const content = JSON.parse(message.content);
    
    // Feishu v2.0 uses message_type
    const type = message.message_type || message.msg_type;

    if (type === "text") {
      text = content.text;
    } else if (type === "post") {
      // Handle rich text (post)
      // content is { title: "", content: [[{ tag: "text", text: "..." }]] }
      if (Array.isArray(content.content)) {
        text = content.content
          .map((line: any[]) => 
            line
              .filter((seg: any) => seg.tag === "text" || seg.tag === "at")
              .map((seg: any) => seg.text)
              .join("")
          )
          .join("\n");
      }
    }
  } catch (e) {
    // Keep text empty if parsing fails
  }

  // Fallback for debugging
  if (!text) {
    text = `[${message.msg_type}]`;
  }

  return {
    id: message.message_id,
    text,
    chatId: message.chat_id,
    senderId: sender.sender_id.open_id,
    senderName: sender.sender_id.user_id || "Feishu User", 
    isGroup,
    raw: payload,
  };
}