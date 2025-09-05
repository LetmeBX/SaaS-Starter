"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardPageWrapper } from "@/app/dashboard/_components/dashboard-page-wrapper";
import { Button } from "@/components/ui/button";
import { ImageAnnotator } from "@/components/invoices/ImageAnnotator";
import { InvoiceReviewPanel } from "@/components/invoices/InvoiceReviewPanel";
import { TemplateEditor } from "@/components/invoices/TemplateEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function InvoiceReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any | null>(null);
  const [activeKey, setActiveKey] = useState<string | undefined>(undefined);
  const [tab, setTab] = useState("review");

  async function load() {
    const res = await fetch(`/api/invoices/${params.id}`);
    if (!res.ok) return;
    const json = await res.json();
    setInvoice(json);
  }

  useEffect(() => { load(); }, [params.id]);

  const boxes = useMemo(() => {
    if (!invoice?.recognizedData) return [] as { key: string; bbox: [number, number, number, number] }[];
    const list: { key: string; bbox: [number, number, number, number] }[] = [];
    const field = invoice.recognizedData.fieldBBoxes || {};
    Object.keys(field).forEach((k) => {
      const b = field[k];
      if (Array.isArray(b) && b.length === 4) list.push({ key: k, bbox: b });
    });
    (invoice.items || []).forEach((it: any, i: number) => {
      if (it?.bbox) list.push({ key: `item-${i}`, bbox: it.bbox });
    });
    return list;
  }, [invoice]);

  async function save(status?: "COMPLETED" | "PENDING_REVIEW") {
    if (!invoice) return;
    const payload: any = { ...invoice };
    if (payload.issueDate && typeof payload.issueDate !== "string") {
      payload.issueDate = new Date(payload.issueDate).toISOString();
    }
    if (status) payload.status = status;
    const res = await fetch(`/api/invoices/${invoice.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) {
      toast.success("已保存");
      if (status === "COMPLETED") router.push("/dashboard/invoices");
    } else {
      toast.error("保存失败");
    }
  }

  async function reprocess() {
    const res = await fetch(`/api/invoices/${invoice.id}/reprocess`, { method: "POST" });
    if (res.ok) {
      toast.success("已重新识别");
      load();
    } else {
      toast.error("操作失败");
    }
  }

  async function exportCurrent() {
    const res = await fetch(`/api/invoices/export`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [invoice.id], format: "csv" }) });
    if (!res.ok) return toast.error("导出失败");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoice.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardPageWrapper
      title="发票审阅"
      parentTitle="发票识别与管理"
      parentUrl="/dashboard/invoices"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => save("PENDING_REVIEW")}>保存</Button>
          <Button onClick={() => save("COMPLETED")}>保存并完成</Button>
          <Button variant="secondary" onClick={reprocess}>重新识别</Button>
          <Button variant="outline" onClick={exportCurrent}>导出当前</Button>
        </div>
      }
    >
      {!invoice ? null : (
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            <ImageAnnotator imageUrl={invoice.fileUrl} boxes={boxes} activeKey={activeKey} />
          </div>
          <div className="col-span-2 space-y-4">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="review">审阅</TabsTrigger>
                <TabsTrigger value="template">模板</TabsTrigger>
              </TabsList>
              <TabsContent value="review">
                <InvoiceReviewPanel invoice={invoice} onFocusField={(k) => setActiveKey(k)} onChange={(next) => setInvoice(next)} />
              </TabsContent>
              <TabsContent value="template">
                <TemplateEditor invoiceId={invoice.id} onApplied={() => setTab("review")} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </DashboardPageWrapper>
  );
}
