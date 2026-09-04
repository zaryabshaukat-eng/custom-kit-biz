import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Pencil, Plus, Receipt, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatusPill } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrency, useStore } from "@/lib/store";
import { docTotals, type BillStatus } from "@/lib/types";

export const Route = createFileRoute("/bills/")({
  head: () => ({
    meta: [
      { title: "Bills & Purchases — ZS Books" },
      { name: "description", content: "Record vendor bills, track payments and restock inventory." },
      { property: "og:title", content: "Bills & Purchases — ZS Books" },
      { property: "og:description", content: "Record vendor bills, track payments and restock inventory." },
    ],
  }),
  component: BillsPage,
});

const filters: (BillStatus | "all")[] = ["all", "draft", "unpaid", "partial", "paid"];

function BillsPage() {
  const { data, deleteBill, recordBillPayment } = useStore();
  const money = useCurrency();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<BillStatus | "all">("all");
  const [payFor, setPayFor] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  const rows = useMemo(
    () => data.bills.filter((b) => filter === "all" || b.status === filter),
    [data.bills, filter],
  );
  const activeBill = data.bills.find((b) => b.id === payFor);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bills"
        subtitle="Vendor purchases feed stock levels and item cost prices."
        action={
          <Button asChild>
            <Link to="/bills/new">
              <Plus className="h-4 w-4" /> New Bill
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3.5 py-1.5 text-sm capitalize transition-colors ${
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "partial" ? "partially paid" : f}
          </button>
        ))}
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Bill</th>
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Vendor Inv #</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Balance</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => {
              const total = docTotals(b.lines).total;
              return (
                <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{b.number}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {data.contacts.find((c) => c.id === b.contactId)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{b.vendorRef || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.dueDate}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={b.status} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {money(Math.max(0, total - b.amountPaid))}
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{money(total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        title="Record payment"
                        aria-label="Record payment"
                        className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-primary"
                        onClick={() => {
                          setPayFor(b.id);
                          setAmount(String(Math.max(0, total - b.amountPaid).toFixed(2)));
                        }}
                      >
                        <Wallet className="h-4 w-4" />
                      </button>
                      <button
                        title="Edit"
                        aria-label="Edit"
                        className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-primary"
                        onClick={() => navigate({ to: "/bills/$id/edit", params: { id: b.id } })}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        title="Delete"
                        aria-label="Delete"
                        className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                        onClick={() => {
                          deleteBill(b.id);
                          toast.success(`${b.number} deleted`);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                  <Receipt className="mx-auto mb-3 h-8 w-8 opacity-40" />
                  No bills in this view yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(payFor)} onOpenChange={(o) => !o && setPayFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record payment — {activeBill?.number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (!payFor) return;
                recordBillPayment(payFor, Number(amount) || 0);
                toast.success("Payment recorded");
                setPayFor(null);
              }}
            >
              Save payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
