import type { IOcrProvider } from "../provider";
import type { OcrResult, OcrTextBlock } from "@/types/invoices";

export class MockOcrProvider implements IOcrProvider {
  async recognize(input: { url: string; contentType: string }): Promise<OcrResult> {
    // Produce deterministic mock text blocks resembling a CN VAT invoice
    const blocks: OcrTextBlock[] = [
      { text: "发票代码: 044031900111", bbox: [0.10, 0.10, 0.30, 0.04] },
      { text: "发票号码: 12345678", bbox: [0.10, 0.15, 0.30, 0.04] },
      { text: "开票日期: 2024-12-31", bbox: [0.10, 0.20, 0.30, 0.04] },
      { text: "购买方名称: 某某科技有限公司", bbox: [0.10, 0.30, 0.50, 0.04] },
      { text: "购买方税号: 91310101MA1234567X", bbox: [0.10, 0.34, 0.50, 0.04] },
      { text: "销售方名称: 测试销售公司", bbox: [0.10, 0.40, 0.50, 0.04] },
      { text: "销售方税号: 91320101MA7654321Y", bbox: [0.10, 0.44, 0.50, 0.04] },
      { text: "合计: 115.00", bbox: [0.60, 0.80, 0.20, 0.04] },
      { text: "税额: 15.00", bbox: [0.60, 0.84, 0.20, 0.04] },
      { text: "价税合计(大写)：壹佰壹拾伍元整", bbox: [0.55, 0.88, 0.35, 0.04] },
      { text: "名 称	规 格	单 位	数 量	单 价	金 额	税 率	税 额", bbox: [0.08, 0.52, 0.84, 0.04] },
      { text: "A商品	100g	件	2	50.00	100.00	13%	13.00", bbox: [0.08, 0.56, 0.84, 0.04] },
      { text: "B配件	--	件	1	0.00	0.00	0%	0.00", bbox: [0.08, 0.60, 0.84, 0.04] },
    ];
    return { blocks, raw: { mocked: true, url: input.url } };
  }
}
