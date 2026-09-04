import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { InvoiceEditor } from "@/components/InvoiceEditor";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/invoices/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Invoice — ZS Books" },
      { name: "description", content: "Edit invoice line items, totals and custom fields." },
      { property: "og:title", content: "Edit Invoice — ZS Books" },
      { property: "og:description", content: "Edit invoice line items, totals and custom fields." },
    ],
  }),
  component: EditInvoicePage,
});

function EditInvoicePage() {
  const { id } = useParams({ from: "/invoices/$id/edit" });
  const { data } = useStore();
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
  return <InvoiceEditor mode="edit" initial={inv} />;
}
