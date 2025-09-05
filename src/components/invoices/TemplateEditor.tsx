"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function TemplateEditor({ invoiceId, onApplied }: { invoiceId: string; onApplied: () => void }) {
  const [name, setName] = useState("");

  async function save() {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, config: {} }),
    });
    if (res.ok) {
      toast.success("模板已保存");
      onApplied();
    } else {
      toast.error("保存失败");
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">自定义模板</div>
      <Input placeholder="模板名称" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="flex gap-2">
        <Button onClick={save}>保存为新模板</Button>
        <Button variant="outline" onClick={onApplied}>应用此模板并退出</Button>
      </div>
    </div>
  );
}
