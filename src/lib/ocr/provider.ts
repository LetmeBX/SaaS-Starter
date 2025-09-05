import type { OcrResult } from "@/types/invoices";

export interface IOcrProvider {
  recognize(input: { url: string; contentType: string }): Promise<OcrResult>;
}

export async function getOcrProvider(): Promise<IOcrProvider> {
  const provider = (process.env.OCR_PROVIDER || "mock").toLowerCase();
  if (provider === "baidu") {
    const mod = await import("./providers/baidu");
    return new mod.BaiduOcrProvider();
  }
  const mod = await import("./providers/mock");
  return new mod.MockOcrProvider();
}
