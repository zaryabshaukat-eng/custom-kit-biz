import { createFileRoute } from "@tanstack/react-router";
import { InvoiceEditor, newInvoiceDraft } from "@/components/InvoiceEditor";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/invoices/new")({
  head: () => ({
    meta: [
      { title: "New Invoice — ZS Books" },
      { name: "description", content: "Create an invoice with line items and custom fields." },
      { property: "og:title", content: "New Invoice — ZS Books" },
      { property: "og:description", content: "Create an invoice with line items and custom fields." },
    ],
  }),
  component: NewInvoicePage,
});

function NewInvoicePage() {
  const { data } = useStore();
  const next = 1001 + data.invoices.length;
  return <InvoiceEditor mode="create" initial={newInvoiceDraft(`${data.settings.invoicePrefix}${next}`)} />;
}
