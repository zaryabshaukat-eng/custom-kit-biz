import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency, useStore, uid } from "@/lib/store";
import { lineAmounts, type LineItem } from "@/lib/types";

export function LineItemsEditor({
  lines,
  onChange,
  priceField,
}: {
  lines: LineItem[];
  onChange: (lines: LineItem[]) => void;
  priceField: "sellingPrice" | "costPrice";
}) {
  const { data } = useStore();
  const money = useCurrency();

  const update = (id: string, patch: Partial<LineItem>) =>
    onChange(lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="pb-2 font-medium">Item / Description</th>
              <th className="w-24 pb-2 font-medium">Qty</th>
              <th className="w-28 pb-2 font-medium">Rate</th>
              <th className="w-24 pb-2 font-medium">Tax %</th>
              <th className="w-24 pb-2 font-medium">Disc %</th>
              <th className="w-28 pb-2 text-right font-medium">Total</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id} className="border-b last:border-0 align-top">
                <td className="py-2 pr-3">
                  <div className="space-y-2">
                    <Select
                      value={l.itemId ?? "none"}
                      onValueChange={(v) => {
                        if (v === "none") return update(l.id, { itemId: undefined });
                        const it = data.items.find((i) => i.id === v);
                        if (!it) return;
                        update(l.id, {
                          itemId: it.id,
                          description: it.description || it.name,
                          rate: it[priceField],
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pick inventory item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Custom line (no item)</SelectItem>
                        {data.items.map((i) => (
                          <SelectItem key={i.id} value={i.id}>
                            {i.name} · {i.sku}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={l.description}
                      placeholder="Description"
                      onChange={(e) => update(l.id, { description: e.target.value })}
                    />
                  </div>
                </td>
                <td className="py-2 pr-3">
                  <Input
                    type="number"
                    min="0"
                    value={l.quantity}
                    onChange={(e) => update(l.id, { quantity: Number(e.target.value) })}
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    type="number"
                    step="0.01"
                    value={l.rate}
                    onChange={(e) => update(l.id, { rate: Number(e.target.value) })}
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    type="number"
                    value={l.taxPercent}
                    onChange={(e) => update(l.id, { taxPercent: Number(e.target.value) })}
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    type="number"
                    value={l.discountPercent}
                    onChange={(e) => update(l.id, { discountPercent: Number(e.target.value) })}
                  />
                </td>
                <td className="py-4 text-right font-medium tabular-nums">
                  {money(lineAmounts(l).total)}
                </td>
                <td className="py-4 text-right">
                  <button
                    type="button"
                    aria-label="Remove line"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => onChange(lines.filter((x) => x.id !== l.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([
            ...lines,
            {
              id: uid(),
              description: "",
              quantity: 1,
              rate: 0,
              taxPercent: data.settings.defaultTax,
              discountPercent: 0,
            },
          ])
        }
      >
        <Plus className="h-4 w-4" /> Add line
      </Button>
    </div>
  );
}
