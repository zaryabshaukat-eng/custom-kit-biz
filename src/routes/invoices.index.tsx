import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Eye, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatusPill } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useCurrency, useStore } from "@/lib/store";
import { docTotals, type InvoiceStatus } from "@/lib/types";

export const Route = createFileRoute("/invoices/")({
  head: () => ({
    meta: [
      { title: "Invoices — ZS Books" },
      { name: "description", content: "Track draft, sent, paid and overdue invoices in ZS Books." },
      { property: "og:title", content: "Invoices — ZS Books" },
      { property: "og:description", content: "Track draft, sent, paid and overdue invoices." },
    ],
  }),
  component: InvoicesPage,
});

const filters: (InvoiceStatus | "all")[] = ["all", "draft", "sent", "paid", "overdue"];

function InvoicesPage() {
  const { data, deleteInvoice, setInvoiceStatus } = useStore();
  const money = useCurrency();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<InvoiceStatus | "all">("all");

  const rows = useMemo(
    () => data.invoices.filter((i) => filter === "all" || i.status === filter),
    [data.invoices, filter],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        subtitle="Every invoice carries your custom fields alongside the standard ones."
        action={
          <Button asChild>
            <Link to="/invoices/new">
              <Plus className="h-4 w-4" /> New Invoice
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
            {f}
          </button>
        ))}
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Issue</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((inv) => (
              <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">
                  <Link to="/invoices/$id" params={{ id: inv.id }} className="hover:text-primary">
                    {inv.number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {data.contacts.find((c) => c.id === inv.contactId)?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{inv.issueDate}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.dueDate}</td>
                <td className="px-4 py-3">
                  <StatusPill status={inv.status} />
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">
                  {money(docTotals(inv.lines).total)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <IconBtn
                      label="View"
                      onClick={() => navigate({ to: "/invoices/$id", params: { id: inv.id } })}
                    >
                      <Eye className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn
                      label="Edit"
                      onClick={() => navigate({ to: "/invoices/$id/edit", params: { id: inv.id } })}
                    >
                      <Pencil className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn
                      label="Mark as paid"
                      onClick={() => {
                        setInvoiceStatus(inv.id, "paid");
                        toast.success(`${inv.number} marked as paid`);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn
                      label="Delete"
                      danger
                      onClick={() => {
                        deleteInvoice(inv.id);
                        toast.success(`${inv.number} deleted`);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconBtn>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                  <FileText className="mx-auto mb-3 h-8 w-8 opacity-40" />
                  No invoices in this view yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted ${
        danger ? "hover:text-destructive" : "hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}
