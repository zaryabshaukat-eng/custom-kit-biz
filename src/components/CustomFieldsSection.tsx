import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import type { CustomField, CustomValues, EntityModule } from "@/lib/types";

export function evaluateFormula(
  formula: string | undefined,
  values: CustomValues,
  extra: Record<string, number> = {},
): number {
  if (!formula) return 0;
  const scope: Record<string, number> = { ...extra };
  Object.entries(values).forEach(([k, v]) => {
    scope[k] = typeof v === "number" ? v : parseFloat(String(v)) || 0;
  });
  const safe = formula.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, (m) => String(scope[m] ?? 0));
  if (!/^[0-9+\-*/().\s]*$/.test(safe)) return 0;
  try {
    // eslint-disable-next-line no-new-func
    const out = Function(`"use strict";return (${safe || 0})`)() as number;
    return Number.isFinite(out) ? out : 0;
  } catch {
    return 0;
  }
}

function FieldControl({
  field,
  value,
  onChange,
  computed,
}: {
  field: CustomField;
  value: string | number | boolean | undefined;
  onChange: (v: string | number | boolean) => void;
  computed: number;
}) {
  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          rows={3}
          placeholder={field.placeholder}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "number":
    case "currency":
      return (
        <Input
          type="number"
          step={field.type === "currency" ? "0.01" : "1"}
          placeholder={field.placeholder}
          value={value === undefined || value === "" ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      );
    case "date":
      return (
        <Input type="date" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      );
    case "select":
      return (
        <Select value={String(value ?? "")} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder || "Select…"} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "checkbox":
      return (
        <div className="flex h-9 items-center gap-2">
          <Checkbox checked={Boolean(value)} onCheckedChange={(c) => onChange(Boolean(c))} />
          <span className="text-sm text-muted-foreground">{field.placeholder || "Yes"}</span>
        </div>
      );
    case "formula":
      return (
        <div className="flex h-9 items-center rounded-md border border-dashed bg-muted/50 px-3 text-sm font-medium tabular-nums">
          {computed.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
      );
    default:
      return (
        <Input
          placeholder={field.placeholder}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

export function CustomFieldsSection({
  module,
  values,
  onChange,
  numericContext = {},
  collapsible = true,
  title = "Additional Information",
}: {
  module: EntityModule;
  values: CustomValues;
  onChange: (next: CustomValues) => void;
  numericContext?: Record<string, number>;
  collapsible?: boolean;
  title?: string;
}) {
  const { fieldsFor } = useStore();
  const fields = fieldsFor(module);
  const [open, setOpen] = useState(true);

  if (fields.length === 0) return null;

  const sections = Array.from(new Set(fields.map((f) => f.section || title)));

  const body = (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section} className="space-y-4">
          {sections.length > 1 && (
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {fields
              .filter((f) => (f.section || title) === section)
              .map((f) => (
                <div key={f.id} className="space-y-1.5">
                  <Label htmlFor={f.key} className="text-sm">
                    {f.name}
                    {f.required && <span className="ml-1 text-destructive">*</span>}
                  </Label>
                  <div id={f.key}>
                    <FieldControl
                      field={f}
                      value={values[f.key] ?? (f.type === "checkbox" ? false : f.defaultValue)}
                      computed={evaluateFormula(f.formula, values, numericContext)}
                      onChange={(v) => onChange({ ...values, [f.key]: v })}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (!collapsible) return body;

  return (
    <section className="surface-card p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="text-base font-semibold">{title}</h3>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="mt-5">{body}</div>}
    </section>
  );
}

export function customDefaults(fields: CustomField[]): CustomValues {
  const v: CustomValues = {};
  fields.forEach((f) => {
    if (f.type === "checkbox") v[f.key] = f.defaultValue === "true";
    else if (f.defaultValue) v[f.key] = f.defaultValue;
  });
  return v;
}
