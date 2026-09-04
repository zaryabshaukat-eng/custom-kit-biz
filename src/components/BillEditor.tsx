import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineItemsEditor } from "./LineItemsEditor";
import { CustomFieldsSection, customDefaults } from "./CustomFieldsSection";
import { PageHeader } from "./AppShell";
import { useCurrency, useStore, uid } from "@/lib/store";
import { docTotals, type Bill, type BillStatus } from "@/lib/types";

export function newBillDraft(number: string): Bill {
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  return {
    id: uid(),
    number,
    vendorRef: "",
    contactId: "",
    issueDate: today,
    dueDate: due,
    status: "draft",
    amountPaid: 0,
    lines: [],
    custom: {},
    stockApplied: false,
  };
}

export function BillEditor({ initial, mode }: { initial: Bill; mode: "create" | "edit" }) {
  const { data, saveBill, saveContact, fieldsFor } = useStore();
  const money = useCurrency();
  const navigate = useNavigate();
  const [bill, setBill] = useState<Bill>({
    ...initial,
    custom: { ...customDefaults(fieldsFor("bills")), ...initial.custom },
  });
  const [newVendor, setNewVendor] = useState("");

  const totals = docTotals(bill.lines);
  const vendors = data.contacts.filter((c) => c.type === "vendor");

  const submit = (status: BillStatus) => {
    if (!bill.contactId) {
      toast.error("Select a vendor first");
      return;
    }
    if (bill.lines.length === 0) {
      toast.error("Add at least one line item");
      return;
    }
    const missing = fieldsFor("bills").find(
      (f) => f.required && !String(bill.custom[f.key] ?? "").trim(),
    );
    if (missing) {
      toast.error(`${missing.name} is required`);
      return;
    }
    saveBill({ ...bill, status });
    toast.success(status === "draft" ? "Bill saved as draft" : `Bill ${bill.number} recorded`);
    navigate({ to: "/bills" });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title={mode === "create" ? "New Bill" : `Edit ${bill.number}`}
        subtitle="Recording a bill increases stock on hand and updates item cost prices."
      />

      <section className="surface-card space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <Label>Vendor</Label>
            <Select
              value={bill.contactId}
              onValueChange={(v) => setBill({ ...bill, contactId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 pt-1">
              <Input
                value={newVendor}
                placeholder="Or add new vendor"
                onChange={(e) => setNewVendor(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!newVendor.trim()) return;
                  const id = uid();
                  saveContact({ id, name: newVendor.trim(), type: "vendor", custom: {} });
                  setBill({ ...bill, contactId: id });
                  setNewVendor("");
                  toast.success("Vendor added");
                }}
              >
                Add
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Bill #</Label>
            <Input
              value={bill.number}
              onChange={(e) => setBill({ ...bill, number: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Vendor Invoice #</Label>
            <Input
              value={bill.vendorRef}
              placeholder="Reference on vendor document"
              onChange={(e) => setBill({ ...bill, vendorRef: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Bill Date</Label>
            <Input
              type="date"
              value={bill.issueDate}
              onChange={(e) => setBill({ ...bill, issueDate: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Due Date</Label>
            <Input
              type="date"
              value={bill.dueDate}
              onChange={(e) => setBill({ ...bill, dueDate: e.target.value })}
            />
          </div>
        </div>
      </section>

      <section className="surface-card space-y-4 p-5">
        <h3 className="text-base font-semibold">Line Items</h3>
        <LineItemsEditor
          lines={bill.lines}
          priceField="costPrice"
          onChange={(lines) => setBill({ ...bill, lines })}
        />
        <div className="ml-auto w-full max-w-xs space-y-2 pt-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums text-foreground">{money(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span>
            <span className="tabular-nums text-foreground">{money(totals.tax)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Bill Total</span>
            <span className="tabular-nums">{money(totals.total)}</span>
          </div>
        </div>
      </section>

      <CustomFieldsSection
        module="bills"
        values={bill.custom}
        onChange={(custom) => setBill({ ...bill, custom })}
        numericContext={{ subtotal: totals.subtotal, tax: totals.tax, total: totals.total }}
      />

      <section className="surface-card space-y-2 p-5">
        <Label>Notes</Label>
        <Textarea
          rows={3}
          value={bill.notes ?? ""}
          onChange={(e) => setBill({ ...bill, notes: e.target.value })}
        />
      </section>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => submit(bill.status === "draft" ? "unpaid" : bill.status)}>
          {bill.status === "draft" ? "Save & Record" : "Save Changes"}
        </Button>
        <Button variant="outline" onClick={() => submit("draft")}>
          Save as Draft
        </Button>
        <Button variant="ghost" onClick={() => navigate({ to: "/bills" })}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
