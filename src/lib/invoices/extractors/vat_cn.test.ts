import { extractVatCn } from "./vat_cn";
import type { OcrResult } from "@/types/invoices";

describe("VAT CN extractor", () => {
  it("parses basic fields and items", () => {
    const ocr: OcrResult = {
      blocks: [
        { text: "发票代码: 044031900111", bbox: [0.1, 0.1, 0.3, 0.04] },
        { text: "发票号码: 12345678", bbox: [0.1, 0.15, 0.3, 0.04] },
        { text: "开票日期: 2024-12-31", bbox: [0.1, 0.2, 0.3, 0.04] },
        { text: "购买方名称: 某某科技有限公司", bbox: [0.1, 0.3, 0.5, 0.04] },
        { text: "购买方税号: 91310101MA1234567X", bbox: [0.1, 0.34, 0.5, 0.04] },
        { text: "销售方名称: 测试销售公司", bbox: [0.1, 0.4, 0.5, 0.04] },
        { text: "销售方税号: 91320101MA7654321Y", bbox: [0.1, 0.44, 0.5, 0.04] },
        { text: "名 称\t规 格\t单 位\t数 量\t单 价\t金 额\t税 率\t税 额", bbox: [0.08, 0.52, 0.84, 0.04] },
        { text: "A商品\t100g\t件\t2\t50.00\t100.00\t13%\t13.00", bbox: [0.08, 0.56, 0.84, 0.04] },
        { text: "合计: 115.00", bbox: [0.6, 0.8, 0.2, 0.04] },
        { text: "税额: 15.00", bbox: [0.6, 0.84, 0.2, 0.04] },
        { text: "价税合计(大写)：壹佰壹拾伍元整", bbox: [0.55, 0.88, 0.35, 0.04] },
      ],
    };

    const res = extractVatCn(ocr);

    expect(res.invoiceCode).toBe("044031900111");
    expect(res.invoiceNumber).toBe("12345678");
    expect(res.issueDate?.toISOString().slice(0, 10)).toBe("2024-12-31");
    expect(res.buyerName).toContain("某某科技");
    expect(res.items.length).toBeGreaterThan(0);
    const item = res.items[0];
    expect(item.amount).toBe(10000);
    expect(res.taxAmount).toBe(1500);
    expect(res.totalAmount).toBe(11500);
  });
});
