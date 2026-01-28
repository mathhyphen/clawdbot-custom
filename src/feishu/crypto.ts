import crypto from "node:crypto";

export class FeishuCipher {
  constructor(private readonly encryptKey: string) {}

  decrypt(encrypted: string): string {
    // 1. Calculate Key: SHA256(encryptKey)
    const key = crypto.createHash("sha256").update(this.encryptKey).digest();
    
    // 2. Decode Base64
    const encryptedBuffer = Buffer.from(encrypted, "base64");
    
    // 3. Extract IV (First 16 bytes)
    const iv = encryptedBuffer.subarray(0, 16);
    
    // 4. Extract Content (Rest)
    const content = encryptedBuffer.subarray(16);

    // 5. Decrypt
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    decipher.setAutoPadding(false); // We handle padding manually

    let decrypted = decipher.update(content);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // 6. Remove PKCS#7 Padding
    // The last byte indicates the length of the padding
    const pad = decrypted[decrypted.length - 1];
    if (pad < 1 || pad > 32) {
      return decrypted.toString("utf8");
    }
    
    return decrypted.subarray(0, decrypted.length - pad).toString("utf8");
  }
}