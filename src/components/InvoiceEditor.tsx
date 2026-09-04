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
import { docTotals, type Invoice, type InvoiceStatus } from "@/lib/types";

export function newInvoiceDraft(number: string): Invoice {
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
  return {
    id: uid(),
    number,
    contactId: "",
    issueDate: today,
    dueDate: due,
    paymentTerms: "Net 15",
    status: "draft",
    lines: [],
    custom: {},
    stockApplied: false,
  };
}

export function InvoiceEditor({ initial, mode }: { initial: Invoice; mode: "create" | "edit" }) {
  const { data, saveInvoice, saveContact, fieldsFor } = useStore();
  const money = useCurrency();
  const navigate = useNavigate();
  const [inv, setInv] = useState<Invoice>({
    ...initial,
    custom: { ...customDefaults(fieldsFor("invoices")), ...initial.custom },
  });
  const [newCustomer, setNewCustomer] = useState("");

  const totals = docTotals(inv.lines);
  const customers = data.contacts.filter((c) => c.type === "customer");

  const submit = (status: InvoiceStatus) => {
    if (!inv.contactId) {
      toast.error("Select a customer first");
      return;
    }
    if (inv.lines.length === 0) {
      toast.error("Add at least one line item");
      return;
    }
    const missing = fieldsFor("invoices").find(
      (f) => f.required && !String(inv.custom[f.key] ?? "").trim(),
    );
    if (missing) {
      toast.error(`${missing.name} is required`);
      return;
    }
    saveInvoice({ ...inv, status });
    toast.success(
      status === "draft" ? "Invoice saved as draft" : `Invoice ${inv.number} ${status}`,
    );
    navigate({ to: "/invoices" });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title={mode === "create" ? "New Invoice" : `Edit ${inv.number}`}
        subtitle="Approving an invoice reduces inventory stock automatically."
      />

      <section className="surface-card space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <Label>Customer</Label>
            <Select value={inv.contactId} onValueChange={(v) => setInv({ ...inv, contactId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 pt-1">
              <Input
                value={newCustomer}
                placeholder="Or add new customer"
                onChange={(e) => setNewCustomer(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!newCustomer.trim()) return;
                  const id = uid();
                  saveContact({ id, name: newCustomer.trim(), type: "customer", custom: {} });
                  setInv({ ...inv, contactId: id });
                  setNewCustomer("");
                  toast.success("Customer added");
                }}
              >
                Add
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Invoice #</Label>
            <Input value={inv.number} onChange={(e) => setInv({ ...inv, number: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Payment Terms</Label>
            <Select
              value={inv.paymentTerms}
              onValueChange={(v) => setInv({ ...inv, paymentTerms: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Due on Receipt", "Net 15", "Net 30", "Net 45", "Net 60"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Issue Date</Label>
            <Input
              type="date"
              value={inv.issueDate}
              onChange={(e) => setInv({ ...inv, issueDate: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Due Date</Label>
            <Input
              type="date"
              value={inv.dueDate}
              onChange={(e) => setInv({ ...inv, dueDate: e.target.value })}
            />
          </div>
        </div>
      </section>

      <section className="surface-card space-y-4 p-5">
        <h3 className="text-base font-semibold">Line Items</h3>
        <LineItemsEditor
          lines={inv.lines}
          priceField="sellingPrice"
          onChange={(lines) => setInv({ ...inv, lines })}
        />
        <div className="ml-auto w-full max-w-xs space-y-2 pt-2 text-sm">
          <Row label="Subtotal" value={money(totals.subtotal)} />
          <Row label="Total Discount" value={`− ${money(totals.discount)}`} />
          <Row label="Total Tax" value={money(totals.tax)} />
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Grand Total</span>
            <span className="tabular-nums">{money(totals.total)}</span>
          </div>
        </div>
      </section>

      <CustomFieldsSection
        module="invoices"
        values={inv.custom}
        onChange={(custom) => setInv({ ...inv, custom })}
        numericContext={{ subtotal: totals.subtotal, tax: totals.tax, total: totals.total }}
      />

      <section className="surface-card space-y-2 p-5">
        <Label>Notes</Label>
        <Textarea
          rows={3}
          value={inv.notes ?? ""}
          placeholder="Notes visible on the invoice"
          onChange={(e) => setInv({ ...inv, notes: e.target.value })}
        />
      </section>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => submit(inv.status === "draft" ? "sent" : inv.status)}>
          {inv.status === "draft" ? "Save & Approve" : "Save Changes"}
        </Button>
        <Button variant="outline" onClick={() => submit("draft")}>
          Save as Draft
        </Button>
        <Button variant="ghost" onClick={() => navigate({ to: "/invoices" })}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </div>
  );
}
