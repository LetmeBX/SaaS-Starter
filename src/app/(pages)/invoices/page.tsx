"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { InvoiceUploader } from "@/components/invoices/InvoiceUploader";
import { SessionGuard } from "@/app/dashboard/_components/session-guard";

export default function InvoicesPage() {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <SessionGuard protectAll>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Upload invoices
          </Button>
        </div>
        <InvoiceUploader open={open} onOpenChange={setOpen} onUploaded={() => setRefreshKey((k) => k + 1)} />
        <div key={refreshKey}>
          <InvoiceList />
        </div>
      </div>
    </SessionGuard>
  );
}
