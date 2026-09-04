import { useMemo, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Boxes,
  ChevronDown,
  FileText,
  LayoutDashboard,
  Plus,
  Receipt,
  Search,
  Settings,
  SlidersHorizontal,
  Menu,
  X,
} from "lucide-react";
import { LogoWordmark } from "./Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/bills", label: "Bills", icon: Receipt },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/custom-fields", label: "Custom Fields", icon: SlidersHorizontal },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function GlobalSearch() {
  const { data } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const out: { label: string; sub: string; to: string }[] = [];
    data.invoices.forEach((i) => {
      const c = data.contacts.find((x) => x.id === i.contactId)?.name ?? "";
      if (`${i.number} ${c}`.toLowerCase().includes(term))
        out.push({ label: i.number, sub: `Invoice · ${c}`, to: `/invoices/${i.id}` });
    });
    data.bills.forEach((b) => {
      const c = data.contacts.find((x) => x.id === b.contactId)?.name ?? "";
      if (`${b.number} ${b.vendorRef} ${c}`.toLowerCase().includes(term))
        out.push({ label: b.number, sub: `Bill · ${c}`, to: `/bills` });
    });
    data.items.forEach((i) => {
      if (`${i.name} ${i.sku}`.toLowerCase().includes(term))
        out.push({ label: i.name, sub: `Item · ${i.sku}`, to: `/inventory` });
    });
    return out.slice(0, 6);
  }, [q, data]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search invoices, bills, items…"
        className="pl-9"
      />
      {results.length > 0 && (
        <div className="surface-card absolute z-40 mt-2 w-full overflow-hidden p-1">
          {results.map((r) => (
            <button
              key={r.to + r.label}
              className="flex w-full flex-col items-start rounded-md px-3 py-2 text-left hover:bg-muted"
              onClick={() => {
                setQ("");
                navigate({ to: r.to });
              }}
            >
              <span className="text-sm font-medium">{r.label}</span>
              <span className="text-xs text-muted-foreground">{r.sub}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  const sidebar = (
    <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between px-5 py-5">
        <LogoWordmark />
        <button className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              isActive(n.to)
                ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="px-5 py-5 text-[11px] leading-relaxed text-sidebar-foreground/50">
        Data is stored locally in your browser.
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen lg:block">{sidebar}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="h-full">{sidebar}</div>
          <div className="flex-1 bg-ink/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-30 flex items-center gap-3 border-b bg-background/85 px-4 py-3 backdrop-blur md:px-6">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <GlobalSearch />
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4" /> Create New
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/invoices/new">New Invoice</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/bills/new">New Bill</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/inventory">New Item</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/custom-fields">New Custom Field</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="no-print mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    sent: "bg-accent text-accent-foreground",
    unpaid: "bg-accent text-accent-foreground",
    partial: "bg-warning/20 text-warning-foreground",
    paid: "bg-success/15 text-success",
    overdue: "bg-destructive/12 text-destructive",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${map[status] ?? "bg-muted"}`}
    >
      {status === "partial" ? "partially paid" : status}
    </span>
  );
}
