import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AppData,
  Bill,
  Contact,
  CustomField,
  EntityModule,
  Invoice,
  Item,
  LineItem,
} from "./types";
import { docTotals } from "./types";

const STORAGE_KEY = "zs-books-data-v1";

export const uid = () => Math.random().toString(36).slice(2, 10);

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const shift = (days: number) => iso(new Date(today.getTime() + days * 86400000));

function seed(): AppData {
  const contacts: Contact[] = [
    {
      id: "c1",
      name: "Northwind Traders",
      type: "customer",
      email: "ap@northwind.example",
      phone: "+1 415 220 1180",
      address: "18 Harbor St, San Francisco, CA",
      custom: {},
    },
    {
      id: "c2",
      name: "Lumen Studio",
      type: "customer",
      email: "billing@lumen.example",
      phone: "+1 212 908 4412",
      address: "440 Broome St, New York, NY",
      custom: {},
    },
    {
      id: "c3",
      name: "Karachi Paper Mills",
      type: "vendor",
      email: "sales@kpm.example",
      phone: "+92 21 3456 7890",
      address: "Plot 22, SITE Area, Karachi",
      custom: {},
    },
    {
      id: "c4",
      name: "Meridian Hardware",
      type: "vendor",
      email: "orders@meridian.example",
      phone: "+1 503 771 2214",
      address: "91 Foundry Rd, Portland, OR",
      custom: {},
    },
  ];

  const items: Item[] = [
    {
      id: "i1",
      name: "A4 Premium Paper Ream",
      sku: "PPR-A4-80",
      type: "goods",
      unit: "ream",
      sellingPrice: 12,
      costPrice: 7.4,
      stock: 240,
      reorderPoint: 60,
      description: "80gsm bright white, 500 sheets",
      custom: {},
    },
    {
      id: "i2",
      name: "Thermal Receipt Roll",
      sku: "THR-57X40",
      type: "goods",
      unit: "roll",
      sellingPrice: 3.5,
      costPrice: 1.8,
      stock: 42,
      reorderPoint: 80,
      description: "57mm x 40mm BPA-free",
      custom: {},
    },
    {
      id: "i3",
      name: "Steel Filing Cabinet",
      sku: "FRN-CAB-4D",
      type: "goods",
      unit: "unit",
      sellingPrice: 189,
      costPrice: 122,
      stock: 14,
      reorderPoint: 5,
      description: "4-drawer, powder-coated",
      custom: {},
    },
    {
      id: "i4",
      name: "Bookkeeping Retainer",
      sku: "SVC-BOOK",
      type: "service",
      unit: "month",
      sellingPrice: 450,
      costPrice: 0,
      stock: 0,
      reorderPoint: 0,
      description: "Monthly ledger reconciliation",
      custom: {},
    },
  ];

  const line = (p: Partial<LineItem>): LineItem => ({
    id: uid(),
    description: "",
    quantity: 1,
    rate: 0,
    taxPercent: 0,
    discountPercent: 0,
    ...p,
  });

  const invoices: Invoice[] = [
    {
      id: "inv1",
      number: "INV-1001",
      contactId: "c1",
      issueDate: shift(-24),
      dueDate: shift(-9),
      paymentTerms: "Net 15",
      status: "overdue",
      notes: "Quarterly stationery supply.",
      lines: [
        line({ itemId: "i1", description: "A4 Premium Paper Ream", quantity: 40, rate: 12, taxPercent: 10 }),
        line({ itemId: "i2", description: "Thermal Receipt Roll", quantity: 30, rate: 3.5, taxPercent: 10 }),
      ],
      custom: {},
      stockApplied: true,
    },
    {
      id: "inv2",
      number: "INV-1002",
      contactId: "c2",
      issueDate: shift(-11),
      dueDate: shift(19),
      paymentTerms: "Net 30",
      status: "sent",
      lines: [
        line({ itemId: "i3", description: "Steel Filing Cabinet", quantity: 4, rate: 189, taxPercent: 10, discountPercent: 5 }),
      ],
      custom: {},
      stockApplied: true,
    },
    {
      id: "inv3",
      number: "INV-1003",
      contactId: "c2",
      issueDate: shift(-40),
      dueDate: shift(-10),
      paymentTerms: "Net 30",
      status: "paid",
      lines: [line({ itemId: "i4", description: "Bookkeeping Retainer", quantity: 1, rate: 450 })],
      custom: {},
      stockApplied: true,
    },
  ];

  const bills: Bill[] = [
    {
      id: "bill1",
      number: "BILL-2001",
      vendorRef: "KPM-88213",
      contactId: "c3",
      issueDate: shift(-18),
      dueDate: shift(12),
      status: "unpaid",
      amountPaid: 0,
      lines: [line({ itemId: "i1", description: "A4 Premium Paper Ream", quantity: 200, rate: 7.4 })],
      custom: {},
      stockApplied: true,
    },
    {
      id: "bill2",
      number: "BILL-2002",
      vendorRef: "MRD-4471",
      contactId: "c4",
      issueDate: shift(-6),
      dueDate: shift(24),
      status: "partial",
      amountPaid: 500,
      lines: [line({ itemId: "i3", description: "Steel Filing Cabinet", quantity: 10, rate: 122 })],
      custom: {},
      stockApplied: true,
    },
  ];

  const customFields: CustomField[] = [
    {
      id: "cf1",
      module: "invoices",
      name: "Purchase Order #",
      key: "po_number",
      type: "text",
      placeholder: "PO-0000",
      required: false,
      section: "Additional Information",
      order: 0,
    },
    {
      id: "cf2",
      module: "invoices",
      name: "Delivery Date",
      key: "delivery_date",
      type: "date",
      required: false,
      section: "Additional Information",
      order: 1,
    },
    {
      id: "cf3",
      module: "bills",
      name: "Approval Status",
      key: "approval_status",
      type: "select",
      options: ["Pending", "Approved", "Rejected"],
      defaultValue: "Pending",
      required: false,
      section: "Additional Information",
      order: 0,
    },
    {
      id: "cf4",
      module: "items",
      name: "Warehouse Bin",
      key: "warehouse_bin",
      type: "text",
      placeholder: "A-12-3",
      required: false,
      section: "Additional Information",
      order: 0,
    },
  ];

  return {
    customFields,
    contacts,
    items,
    invoices,
    bills,
    settings: {
      orgName: "Zaryab Shaukat & Co.",
      currency: "USD",
      invoicePrefix: "INV-",
      billPrefix: "BILL-",
      defaultTax: 10,
      address: "Suite 4, Clifton Block 5, Karachi",
    },
  };
}

interface StoreValue {
  data: AppData;
  ready: boolean;
  fieldsFor: (m: EntityModule) => CustomField[];
  saveField: (f: CustomField) => void;
  deleteField: (id: string) => void;
  moveField: (id: string, dir: -1 | 1) => void;
  saveContact: (c: Contact) => void;
  saveItem: (i: Item) => void;
  deleteItem: (id: string) => void;
  saveInvoice: (i: Invoice) => void;
  deleteInvoice: (id: string) => void;
  setInvoiceStatus: (id: string, s: Invoice["status"]) => void;
  saveBill: (b: Bill) => void;
  deleteBill: (id: string) => void;
  recordBillPayment: (id: string, amount: number) => void;
  updateSettings: (s: AppData["settings"]) => void;
  resetData: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => seed());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw) as AppData);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, ready]);

  const adjustStock = useCallback((items: Item[], lines: LineItem[], sign: number) => {
    const next = items.map((it) => ({ ...it }));
    lines.forEach((l) => {
      if (!l.itemId) return;
      const target = next.find((it) => it.id === l.itemId);
      if (target && target.type === "goods") target.stock += sign * (Number(l.quantity) || 0);
    });
    return next;
  }, []);

  const value = useMemo<StoreValue>(() => {
    const patch = (fn: (d: AppData) => AppData) => setData((d) => fn(d));

    return {
      data,
      ready,
      fieldsFor: (m) =>
        data.customFields.filter((f) => f.module === m).sort((a, b) => a.order - b.order),
      saveField: (f) =>
        patch((d) => ({
          ...d,
          customFields: d.customFields.some((x) => x.id === f.id)
            ? d.customFields.map((x) => (x.id === f.id ? f : x))
            : [...d.customFields, f],
        })),
      deleteField: (id) =>
        patch((d) => ({ ...d, customFields: d.customFields.filter((f) => f.id !== id) })),
      moveField: (id, dir) =>
        patch((d) => {
          const target = d.customFields.find((f) => f.id === id);
          if (!target) return d;
          const group = d.customFields
            .filter((f) => f.module === target.module)
            .sort((a, b) => a.order - b.order);
          const idx = group.findIndex((f) => f.id === id);
          const swap = idx + dir;
          if (swap < 0 || swap >= group.length) return d;
          const reordered = [...group];
          [reordered[idx], reordered[swap]] = [reordered[swap], reordered[idx]];
          const orders = new Map(reordered.map((f, i) => [f.id, i]));
          return {
            ...d,
            customFields: d.customFields.map((f) =>
              orders.has(f.id) ? { ...f, order: orders.get(f.id)! } : f,
            ),
          };
        }),
      saveContact: (c) =>
        patch((d) => ({
          ...d,
          contacts: d.contacts.some((x) => x.id === c.id)
            ? d.contacts.map((x) => (x.id === c.id ? c : x))
            : [...d.contacts, c],
        })),
      saveItem: (i) =>
        patch((d) => ({
          ...d,
          items: d.items.some((x) => x.id === i.id)
            ? d.items.map((x) => (x.id === i.id ? i : x))
            : [...d.items, i],
        })),
      deleteItem: (id) => patch((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) })),
      saveInvoice: (inv) =>
        patch((d) => {
          const prev = d.invoices.find((x) => x.id === inv.id);
          let items = d.items;
          if (prev?.stockApplied) items = adjustStock(items, prev.lines, +1);
          const shouldApply = inv.status !== "draft";
          if (shouldApply) items = adjustStock(items, inv.lines, -1);
          const saved = { ...inv, stockApplied: shouldApply };
          return {
            ...d,
            items,
            invoices: prev
              ? d.invoices.map((x) => (x.id === inv.id ? saved : x))
              : [saved, ...d.invoices],
          };
        }),
      deleteInvoice: (id) =>
        patch((d) => {
          const prev = d.invoices.find((x) => x.id === id);
          const items = prev?.stockApplied ? adjustStock(d.items, prev.lines, +1) : d.items;
          return { ...d, items, invoices: d.invoices.filter((x) => x.id !== id) };
        }),
      setInvoiceStatus: (id, s) =>
        patch((d) => {
          const prev = d.invoices.find((x) => x.id === id);
          if (!prev) return d;
          let items = d.items;
          const shouldApply = s !== "draft";
          if (prev.stockApplied && !shouldApply) items = adjustStock(items, prev.lines, +1);
          if (!prev.stockApplied && shouldApply) items = adjustStock(items, prev.lines, -1);
          return {
            ...d,
            items,
            invoices: d.invoices.map((x) =>
              x.id === id ? { ...x, status: s, stockApplied: shouldApply } : x,
            ),
          };
        }),
      saveBill: (bill) =>
        patch((d) => {
          const prev = d.bills.find((x) => x.id === bill.id);
          let items = d.items;
          if (prev?.stockApplied) items = adjustStock(items, prev.lines, -1);
          const shouldApply = bill.status !== "draft";
          if (shouldApply) {
            items = adjustStock(items, bill.lines, +1);
            items = items.map((it) => {
              const l = bill.lines.find((x) => x.itemId === it.id);
              return l && l.rate > 0 ? { ...it, costPrice: l.rate } : it;
            });
          }
          const saved = { ...bill, stockApplied: shouldApply };
          return {
            ...d,
            items,
            bills: prev ? d.bills.map((x) => (x.id === bill.id ? saved : x)) : [saved, ...d.bills],
          };
        }),
      deleteBill: (id) =>
        patch((d) => {
          const prev = d.bills.find((x) => x.id === id);
          const items = prev?.stockApplied ? adjustStock(d.items, prev.lines, -1) : d.items;
          return { ...d, items, bills: d.bills.filter((x) => x.id !== id) };
        }),
      recordBillPayment: (id, amount) =>
        patch((d) => ({
          ...d,
          bills: d.bills.map((b) => {
            if (b.id !== id) return b;
            const paid = Math.max(0, b.amountPaid + amount);
            const total = docTotals(b.lines).total;
            const status: Bill["status"] =
              paid >= total - 0.01 ? "paid" : paid > 0 ? "partial" : "unpaid";
            return { ...b, amountPaid: paid, status, stockApplied: true };
          }),
        })),
      updateSettings: (s) => patch((d) => ({ ...d, settings: s })),
      resetData: () => setData(seed()),
    };
  }, [data, ready, adjustStock]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function useCurrency() {
  const { data } = useStore();
  const code = data.settings.currency || "USD";
  return useCallback(
    (n: number) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: code }).format(
        Number.isFinite(n) ? n : 0,
      ),
    [code],
  );
}
