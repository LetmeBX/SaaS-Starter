import type { IOcrProvider } from "../provider";
import type { OcrResult } from "@/types/invoices";

export class BaiduOcrProvider implements IOcrProvider {
  async recognize(input: { url: string; contentType: string }): Promise<OcrResult> {
    // Placeholder for future Baidu OCR integration
    throw new Error("Baidu OCR provider not configured in MVP");
  }
}
