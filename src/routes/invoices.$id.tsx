import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/AppShell";
import { useCurrency, useStore } from "@/lib/store";
import { docTotals, lineAmounts } from "@/lib/types";

export const Route = createFileRoute("/invoices/$id")({
  head: () => ({
    meta: [
      { title: "Invoice Detail — ZS Books" },
      { name: "description", content: "Printable invoice template with line items and totals." },
      { property: "og:title", content: "Invoice Detail — ZS Books" },
      { property: "og:description", content: "Printable invoice template with line items and totals." },
    ],
  }),
  component: InvoiceDetail,
});

function InvoiceDetail() {
  const { id } = useParams({ from: "/invoices/$id" });
  const { data, fieldsFor } = useStore();
  const money = useCurrency();
  const inv = data.invoices.find((i) => i.id === id);

  if (!inv) {
    return (
      <div className="surface-card p-10 text-center text-muted-foreground">
        Invoice not found.{" "}
        <Link to="/invoices" className="text-primary underline">
          Back to invoices
        </Link>
      </div>
    );
  }

  const customer = data.contacts.find((c) => c.id === inv.contactId);
  const totals = docTotals(inv.lines);
  const fields = fieldsFor("invoices").filter((f) => inv.custom[f.key] !== undefined && inv.custom[f.key] !== "");

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" asChild>
          <Link to="/invoices">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/invoices/$id/edit" params={{ id: inv.id }}>
              Edit
            </Link>
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Export / Print PDF
          </Button>
        </div>
      </div>

      <article className="surface-card space-y-8 p-8">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b pb-6">
          <div className="flex items-center gap-3">
            <Logo size={44} />
            <div>
              <h1 className="text-lg font-bold">{data.settings.orgName}</h1>
              <p className="text-sm text-muted-foreground">{data.settings.address}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold tracking-tight">INVOICE</h2>
            <p className="text-sm text-muted-foreground">{inv.number}</p>
            <div className="mt-2 flex justify-end">
              <StatusPill status={inv.status} />
            </div>
          </div>
        </header>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Billed To</p>
            <p className="mt-1 font-medium">{customer?.name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{customer?.address}</p>
            <p className="text-sm text-muted-foreground">{customer?.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Dates</p>
            <p className="mt-1 text-sm">Issued: {inv.issueDate}</p>
            <p className="text-sm">Due: {inv.dueDate}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Terms</p>
            <p className="mt-1 text-sm">{inv.paymentTerms}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-2 font-medium">Description</th>
                <th className="py-2 text-right font-medium">Qty</th>
                <th className="py-2 text-right font-medium">Rate</th>
                <th className="py-2 text-right font-medium">Tax</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {inv.lines.map((l) => (
                <tr key={l.id} className="border-b last:border-0">
                  <td className="py-3">{l.description || "—"}</td>
                  <td className="py-3 text-right tabular-nums">{l.quantity}</td>
                  <td className="py-3 text-right tabular-nums">{money(l.rate)}</td>
                  <td className="py-3 text-right tabular-nums">{l.taxPercent}%</td>
                  <td className="py-3 text-right font-medium tabular-nums">
                    {money(lineAmounts(l).total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums text-foreground">{money(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Discount</span>
            <span className="tabular-nums text-foreground">− {money(totals.discount)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span>
            <span className="tabular-nums text-foreground">{money(totals.tax)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Grand Total</span>
            <span className="tabular-nums">{money(totals.total)}</span>
          </div>
        </div>

        {fields.length > 0 && (
          <div className="border-t pt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Additional Information
            </p>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.id} className="text-sm">
                  <dt className="text-muted-foreground">{f.name}</dt>
                  <dd className="font-medium">{String(inv.custom[f.key])}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {inv.notes && (
          <p className="border-t pt-6 text-sm text-muted-foreground">{inv.notes}</p>
        )}
      </article>
    </div>
  );
}
