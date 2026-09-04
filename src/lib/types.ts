export type EntityModule = "invoices" | "bills" | "items" | "contacts";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency"
  | "date"
  | "select"
  | "checkbox"
  | "formula";

export interface CustomField {
  id: string;
  module: EntityModule;
  name: string;
  key: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  defaultValue?: string;
  options?: string[];
  section: string;
  formula?: string;
  order: number;
}

export type CustomValues = Record<string, string | number | boolean>;

export interface Contact {
  id: string;
  name: string;
  type: "customer" | "vendor";
  email?: string;
  phone?: string;
  address?: string;
  custom: CustomValues;
}

export interface Item {
  id: string;
  name: string;
  sku: string;
  type: "goods" | "service";
  unit: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  reorderPoint: number;
  description?: string;
  custom: CustomValues;
}

export interface LineItem {
  id: string;
  itemId?: string;
  description: string;
  quantity: number;
  rate: number;
  taxPercent: number;
  discountPercent: number;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export type BillStatus = "draft" | "unpaid" | "partial" | "paid";

export interface Invoice {
  id: string;
  number: string;
  contactId: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  notes?: string;
  status: InvoiceStatus;
  lines: LineItem[];
  custom: CustomValues;
  stockApplied: boolean;
}

export interface Bill {
  id: string;
  number: string;
  vendorRef: string;
  contactId: string;
  issueDate: string;
  dueDate: string;
  status: BillStatus;
  amountPaid: number;
  notes?: string;
  lines: LineItem[];
  custom: CustomValues;
  stockApplied: boolean;
}

export interface AppSettings {
  orgName: string;
  currency: string;
  invoicePrefix: string;
  billPrefix: string;
  defaultTax: number;
  address: string;
}

export interface AppData {
  customFields: CustomField[];
  contacts: Contact[];
  items: Item[];
  invoices: Invoice[];
  bills: Bill[];
  settings: AppSettings;
}

export function lineAmounts(l: LineItem) {
  const gross = l.quantity * l.rate;
  const discount = (gross * (l.discountPercent || 0)) / 100;
  const net = gross - discount;
  const tax = (net * (l.taxPercent || 0)) / 100;
  return { gross, discount, net, tax, total: net + tax };
}

export function docTotals(lines: LineItem[]) {
  return lines.reduce(
    (acc, l) => {
      const a = lineAmounts(l);
      acc.subtotal += a.gross;
      acc.discount += a.discount;
      acc.tax += a.tax;
      acc.total += a.total;
      return acc;
    },
    { subtotal: 0, discount: 0, tax: 0, total: 0 },
  );
}
