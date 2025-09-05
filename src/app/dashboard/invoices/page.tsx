"use client";

import { useState } from "react";
import { DashboardPageWrapper } from "@/app/dashboard/_components/dashboard-page-wrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { InvoiceUploader } from "@/components/invoices/InvoiceUploader";

export default function InvoicesPage() {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <DashboardPageWrapper
      title="发票识别与管理"
      actions={<Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> 上传发票</Button>}
    >
      <InvoiceUploader open={open} onOpenChange={setOpen} onUploaded={() => setRefreshKey((k) => k + 1)} />
      {/* trigger refresh by key change */}
      <div key={refreshKey}>
        <InvoiceList />
      </div>
    </DashboardPageWrapper>
  );
}
