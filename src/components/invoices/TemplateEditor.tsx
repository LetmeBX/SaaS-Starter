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
      toast.success("Template saved");
      onApplied();
    } else {
      toast.error("Save failed");
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Custom Template</div>
      <Input placeholder="Template name" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="flex gap-2">
        <Button onClick={save}>Save as new template</Button>
        <Button variant="outline" onClick={onApplied}>Apply and close</Button>
      </div>
    </div>
  );
}
