"use client";

import { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import Link from "next/link";
import { toast } from "sonner";

interface Row {
  id: string;
  fileUrl: string;
  invoiceCode: string | null;
  invoiceNumber: string | null;
  issueDate: string | null;
  amountWithTax: number | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
}

export function InvoiceList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ page: number; pageSize: number; total: number; rows: Row[] }>({ page: 1, pageSize: 10, total: 0, rows: [] });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);

  const pageCount = useMemo(() => Math.ceil((data.total || 0) / data.pageSize), [data.total, data.pageSize]);

  async function fetchData(page = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(data.pageSize));
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      const res = await fetch(`/api/invoices?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  async function reprocess(id: string) {
    const res = await fetch(`/api/invoices/${id}/reprocess`, { method: "POST" });
    if (res.ok) {
      toast.success("Reprocessed");
      fetchData(data.page);
    } else {
      toast.error("Operation failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Are you sure to delete this invoice?")) return;
    const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted");
      fetchData(data.page);
    } else {
      toast.error("Delete failed");
    }
  }

  async function exportSelected(all = false) {
    const ids = all ? data.rows.map((r) => r.id) : data.rows.filter(() => false).map((r) => r.id); // placeholder for batch select
    if (ids.length === 0) return toast.info("Please select invoices to export");
    const res = await fetch(`/api/invoices/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, format: "csv" }),
    });
    if (!res.ok) return toast.error("Export failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="Search code/number" value={q} onChange={(e) => setQ(e.target.value)} className="w-48" />
        <Select value={status} onValueChange={(v) => setStatus(v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="UPLOADED">UPLOADED</SelectItem>
            <SelectItem value="PROCESSING">PROCESSING</SelectItem>
            <SelectItem value="PENDING_REVIEW">PENDING_REVIEW</SelectItem>
            <SelectItem value="COMPLETED">COMPLETED</SelectItem>
            <SelectItem value="FAILED">FAILED</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => exportSelected(true)}>Export current list</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Invoice Code</TableHead>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Total (with tax)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  {row.fileUrl?.endsWith(".pdf") ? (
                    <span className="text-xs text-muted-foreground">PDF</span>
                  ) : (
                    <img src={row.fileUrl} alt="thumb" className="h-10 w-10 rounded object-cover" />
                  )}
                </TableCell>
                <TableCell>{row.invoiceCode || "-"}</TableCell>
                <TableCell>{row.invoiceNumber || "-"}</TableCell>
                <TableCell>{row.issueDate ? new Date(row.issueDate).toLocaleDateString() : "-"}</TableCell>
                <TableCell>{row.amountWithTax != null ? (row.amountWithTax / 100).toFixed(2) : "-"}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "FAILED" ? "destructive" : row.status === "COMPLETED" ? "default" : "secondary"}>{row.status}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/invoices/${row.id}/review`} className="text-primary text-sm">Review</Link>
                  <button className="text-sm text-blue-600" onClick={() => reprocess(row.id)}>Reprocess</button>
                  <button className="text-sm text-red-600" onClick={() => remove(row.id)}>Delete</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Pagination
          page={data.page}
          pageCount={pageCount}
          onPageChange={(p) => fetchData(p)}
        />
      </div>
    </div>
  );
}
