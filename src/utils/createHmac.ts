import crypto from "crypto";

export function createHmacSignature(
  payload: Record<string, unknown>,
  secret: string,
) {
  const stringified = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", secret)
    .update(stringified)
    .digest("hex");
 return signature;
}
