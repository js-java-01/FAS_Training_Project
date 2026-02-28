import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { TooltipWrapper } from "@/components/TooltipWrapper";
import type { FieldSchema } from "@/types/common/datatable";
import { useRef, useState, useEffect, useMemo } from "react";

function OverflowBadges({ items, labelField, valueField }: {
  items: any[];
  labelField: string;
  valueField: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);
  const rafRef = useRef<number>(0);
  const visibleCountRef = useRef(visibleCount);

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const recalculate = () => {
      if (!containerRef.current || !measureRef.current) return;
      const availableWidth = containerRef.current.clientWidth;
      if (availableWidth === 0) return;

      const children = Array.from(measureRef.current.children) as HTMLElement[];
      const badgeEls = children.slice(0, items.length);
      const plusBadge = children[items.length];
      const gap = 4;
      const plusWidth = plusBadge ? plusBadge.offsetWidth + gap : 0;

      let usedWidth = 0;
      let count = items.length;

      for (let i = 0; i < badgeEls.length; i++) {
        const badgeWidth = badgeEls[i].offsetWidth;
        const addedWidth = i === 0 ? badgeWidth : badgeWidth + gap;

        if (usedWidth + addedWidth > availableWidth) {
          count = i;
          break;
        }

        usedWidth += addedWidth;

        if (i < badgeEls.length - 1) {
          const remaining = availableWidth - usedWidth;
          if (remaining < plusWidth) {
            count = i + 1;
            break;
          }
        }
      }

      // Only update state if value actually changed
      if (visibleCountRef.current !== count) {
        visibleCountRef.current = count;
        setVisibleCount(count);
      }
    };

    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(recalculate);
    };

    const observer = new ResizeObserver(onResize);
    observer.observe(container);

    // Initial calculation
    recalculate();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [items.length]);

  const fullText = useMemo(
    () => items.map((m) => m[labelField]).join(", "),
    [items, labelField]
  );
  const hiddenCount = items.length - visibleCount;

  return (
    <TooltipWrapper content={fullText || "—"}>
      <div ref={containerRef} className="relative overflow-hidden">
        {/* Hidden measurement div */}
        <div
          ref={measureRef}
          className="flex gap-1 flex-nowrap absolute top-0 left-0 invisible pointer-events-none h-0"
          aria-hidden="true"
        >
          {items.map((m) => (
            <Badge key={m[valueField]} variant="secondary" className="text-xs shrink-0">
              {m[labelField]}
            </Badge>
          ))}
          <Badge variant="outline" className="text-xs shrink-0">
            +{items.length}
          </Badge>
        </div>

        {/* Visible badges */}
        <div className="flex gap-1 flex-nowrap">
          {items.slice(0, visibleCount).map((m) => (
            <Badge key={m[valueField]} variant="secondary" className="text-xs shrink-0">
              {m[labelField]}
            </Badge>
          ))}
          {hiddenCount > 0 && (
            <Badge variant="outline" className="text-xs shrink-0">
              +{hiddenCount}
            </Badge>
          )}
        </div>
      </div>
    </TooltipWrapper>
  );
}

interface CellRendererProps {
  field: FieldSchema;
  value: any;
  relationOptions?: Record<string, any[]>;
  onBooleanToggle?: (fieldName: string, newValue: boolean) => void;
}

export function CellRenderer({ field, value, relationOptions = {}, onBooleanToggle }: CellRendererProps) {
  if (field.type === "boolean") {
    const labels = field.booleanLabels || { true: "Yes", false: "No" };
    const label = value ? labels.true : labels.false;
    return (
      <TableCell>
        <TooltipWrapper content={label}>
          <div className="inline-flex">
            <Switch
              checked={!!value}
              onCheckedChange={(checked) => onBooleanToggle?.(field.name, checked)}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-primary/40"
            />
          </div>
        </TooltipWrapper>
      </TableCell>
    );
  }

  if (field.type === "relation" && field.relation) {
    const options: any[] = relationOptions[field.name] ?? [];
    const { valueField, labelField, multiple } = field.relation;

    if (multiple && Array.isArray(value)) {
      const matched = value
        .map((v: any) =>
          options.find((opt) => opt[valueField]?.toString() === v?.toString())
        )
        .filter(Boolean);
      return (
        <TableCell>
          {matched.length > 0 ? (
            <OverflowBadges
              items={matched}
              labelField={labelField}
              valueField={valueField}
            />
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
      );
    }

    const matched = options.find(
      (opt) => opt[valueField]?.toString() === value?.toString()
    );
    const displayText = matched ? matched[labelField] : (value ?? "—");
    return (
      <TableCell>
        <TooltipWrapper content={String(displayText)}>
          <span className="block truncate">{displayText}</span>
        </TooltipWrapper>
      </TableCell>
    );
  }

  const displayValue = value ?? "—";
  const displayStr = field.type === "date" && value
    ? (() => {
        try {
          return new Date(value).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch {
          return String(value);
        }
      })()
    : String(displayValue);

  return (
    <TableCell>
      <TooltipWrapper content={displayStr}>
        <span className="block truncate">{displayStr}</span>
      </TooltipWrapper>
    </TableCell>
  );
}
