"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface Item {
  name: string;
  model?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  taxRate?: number;
  taxAmount?: number;
  bbox?: [number, number, number, number];
}

export function InvoiceReviewPanel({
  invoice,
  onFocusField,
  onChange,
}: {
  invoice: any;
  onFocusField: (key: string) => void;
  onChange: (next: any) => void;
}) {
  const [form, setForm] = useState<any>(invoice);

  useEffect(() => setForm(invoice), [invoice]);

  function setField(key: string, value: any) {
    const next = { ...form, [key]: value };
    setForm(next);
    onChange(next);
  }

  function setItem(i: number, key: keyof Item, value: any) {
    const items = [...(form.items || [])];
    items[i] = { ...items[i], [key]: value };
    setField("items", items);
  }

  const sumAmount = (form.items || []).reduce((s: number, it: Item) => s + (it.amount || 0), 0);
  const sumTax = (form.items || []).reduce((s: number, it: Item) => s + (it.taxAmount || 0), 0);
  const sumWithTax = sumAmount + sumTax;
  const mismatch = form.amountWithTax != null && sumWithTax !== form.amountWithTax;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Invoice Code</label>
          <Input value={form.invoiceCode || ""} onFocus={() => onFocusField("invoiceCode")} onChange={(e) => setField("invoiceCode", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Invoice Number</label>
          <Input value={form.invoiceNumber || ""} onFocus={() => onFocusField("invoiceNumber")} onChange={(e) => setField("invoiceNumber", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Issue Date</label>
          <Input value={form.issueDate ? new Date(form.issueDate).toISOString().slice(0,10) : ""} onFocus={() => onFocusField("issueDate")} onChange={(e) => setField("issueDate", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Buyer Name</label>
          <Input value={form.buyerName || ""} onFocus={() => onFocusField("buyerName")} onChange={(e) => setField("buyerName", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Buyer Tax ID</label>
          <Input value={form.buyerTaxId || ""} onFocus={() => onFocusField("buyerTaxId")} onChange={(e) => setField("buyerTaxId", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Seller Name</label>
          <Input value={form.sellerName || ""} onFocus={() => onFocusField("sellerName")} onChange={(e) => setField("sellerName", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Seller Tax ID</label>
          <Input value={form.sellerTaxId || ""} onFocus={() => onFocusField("sellerTaxId")} onChange={(e) => setField("sellerTaxId", e.target.value)} />
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-medium">Items</div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price (cents)</TableHead>
                <TableHead>Amount (cents)</TableHead>
                <TableHead>Tax Rate</TableHead>
                <TableHead>Tax Amount (cents)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(form.items || []).map((it: Item, i: number) => (
                <TableRow key={i}>
                  <TableCell>
                    <Input value={it.name || ""} onFocus={() => onFocusField(`item-${i}`)} onChange={(e) => setItem(i, "name", e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={it.quantity ?? ""} onChange={(e) => setItem(i, "quantity", Number(e.target.value))} />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={it.unitPrice ?? ""} onChange={(e) => setItem(i, "unitPrice", Number(e.target.value))} />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={it.amount ?? ""} onChange={(e) => setItem(i, "amount", Number(e.target.value))} />
                  </TableCell>
                  <TableCell>
                    <Input type="number" step="0.01" value={it.taxRate ?? ""} onChange={(e) => setItem(i, "taxRate", Number(e.target.value))} />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={it.taxAmount ?? ""} onChange={(e) => setItem(i, "taxAmount", Number(e.target.value))} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Total (cents)</label>
          <Input type="number" value={form.totalAmount ?? ""} onFocus={() => onFocusField("totalAmount")} onChange={(e) => setField("totalAmount", Number(e.target.value))} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Tax (cents)</label>
          <Input type="number" value={form.taxAmount ?? ""} onFocus={() => onFocusField("taxAmount")} onChange={(e) => setField("taxAmount", Number(e.target.value))} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Total with tax (cents)</label>
          <Input type="number" value={form.amountWithTax ?? ""} onFocus={() => onFocusField("amountWithTax")} onChange={(e) => setField("amountWithTax", Number(e.target.value))} />
        </div>
      </div>

      {mismatch && (
        <div className="text-red-600 text-sm">Totals mismatch: sum(items) + sum(tax) != total with tax.</div>
      )}
    </div>
  );
}
