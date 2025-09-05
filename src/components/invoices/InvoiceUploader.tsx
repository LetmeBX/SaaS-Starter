"use client";

import { useState } from "react";
import { FileUploader } from "@/components/ui/file-uploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded?: () => void;
}

export function InvoiceUploader({ open, onOpenChange, onUploaded }: Props) {
  const [posting, setPosting] = useState(false);

  async function handleUploadComplete(files: { key: string; url: string; contentType: string; fileName: string; size: number }[]) {
    try {
      setPosting(true);
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to create invoices");
      }
      toast.success("上传完成，正在识别...");
      onOpenChange(false);
      onUploaded?.();
    } catch (e: any) {
      toast.error(e?.message || "上传失败");
    } finally {
      setPosting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>上传发票</DialogTitle>
        </DialogHeader>
        <FileUploader
          acceptedFileTypes={["image/png", "image/jpeg", "image/gif", "application/pdf"]}
          maxFiles={10}
          onUploadComplete={handleUploadComplete}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={posting}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
