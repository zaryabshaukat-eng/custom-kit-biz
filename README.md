# Build a modern, full-stack, responsive web application for managing invoices, bills, inventory,...

Build a modern, full-stack, responsive web application for managing invoices, bills, inventory, and custom fields—designed as a customizable alternative to Zoho Books.

### Key Features & Requirements

1. **Global Navigation & Layout:**

   - Sidebar navigation: Dashboard, Invoices, Bills, Inventory, Custom Fields, Settings.

   - Clean UI using Tailwind CSS, Lucide icons, and Shadcn UI components.

   - Global search bar and fast-action "+ Create New" dropdown.

2. **Dynamic Custom Fields Engine (Core Architectural Feature):**

   - A dedicated **Custom Fields Manager** page where users can create, edit, reorder, or delete custom fields for four entity modules: `Invoices`, `Bills`, `Inventory Items`, and `Contacts`.

   - Supported Field Types: Single-line Text, Multi-line Text, Number, Currency, Date, Dropdown (Select), Checkbox, and Formula/Calculated field.

   - Attributes per field: Field Name, Field Key, Placeholder, Required Toggle, Default Value, Options (for Dropdown), and Section Placement.

   - **Crucial Rule:** Every create/edit form across the app MUST dynamically render these custom fields alongside standard fields, and store their values seamlessly.

3. **Invoices Module:**

   - **Invoice Creation & Editor:**

     - Select/Create Customer.

     - Invoice Number, Issue Date, Due Date, Payment Terms.

     - Dynamic Line Items table: Pick item from Inventory (auto-fills description & unit price), Quantity, Tax %, Discount, Line Total.

     - Auto-calculated Subtotal, Total Tax, Total Discount, Grand Total.

     - Render custom fields dynamically in a dedicated "Additional Information" collapsible section.

   - **Invoice List View:** Filterable table by status (Draft, Sent, Paid, Overdue) with actions (Edit, Export PDF preview, Mark as Paid, Delete).

   - **Invoice Detail View:** Printable/exportable invoice template layout.

4. **Bills / Purchases Module:**

   - **Bill Entry Form:** Select Vendor, Bill Number, Vendor Invoice #, Date, Due Date.

   - Line items section linked to inventory items (updating cost prices).

   - Dynamic custom fields injection for Bills.

   - **Bill List View:** Status tracking (Draft, Unpaid, Partially Paid, Paid) and quick payment recording.

5. **Inventory Management Module:**

   - **Item Catalog:** List view of products/services with SKU, Stock on Hand, Purchase Price, Selling Price, and Reorder Point.

   - **Item Creation / Edit Modal:** Item Name, SKU, Type (Goods/Service), Unit, Selling Price, Cost Price, Initial Stock Quantity, and dynamic custom fields.

   - **Stock Movements & Auto-Adjustment:**

     - Creating/approving an **Invoice** automatically decreases inventory stock for selected items.

     - Creating/approving a **Bill** automatically increases inventory stock.

   - Low-stock badge alert for items below their reorder point.

6. **Dashboard Overview:**

   - Summary Cards: Total Unpaid Invoices, Total Unpaid Bills, Total Inventory Value, Low Stock Count.

   - Recent Transactions table and quick bar chart comparing Monthly Sales vs. Expenses.

7. **Data & State Persistence:**

   - Use mock data initialized via LocalStorage or Supabase so data persists across refreshes and custom fields immediately update the form schemas across the app.
Also Insert a Logo with a Stylish ZS which stands for Zaryab SHaukat

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b444e79a-6f82-4393-b940-58077d3897b6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
