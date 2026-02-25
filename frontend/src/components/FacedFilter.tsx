import * as React from "react";
import { Check, PlusCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface FacetedFilterOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface FacetedFilterProps<T extends string> {
  title: string;
  options: FacetedFilterOption<T>[];
  value: T[]; // current selected values
  setValue: (vals: T[]) => void;
  multiple?: boolean;
}

export function FacetedFilter<T extends string>({
  title,
  options,
  value,
  setValue,
  multiple = true,
}: FacetedFilterProps<T>) {
  const [open, setOpen] = React.useState(false);
  const selectedValues = new Set(value);

  const onItemSelect = (option: FacetedFilterOption<T>) => {
    if (multiple) {
      const newSelected = new Set(selectedValues);
      if (selectedValues.has(option.value)) newSelected.delete(option.value);
      else newSelected.add(option.value);
      setValue(Array.from(newSelected) as T[]);
    } else {
      setValue([option.value] as T[]);
      setOpen(false);
    }
  };

  const onReset = () => setValue([]);

  const selectedLabels = options
    .filter((opt) => selectedValues.has(opt.value))
    .map((opt) => opt.label);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          {selectedValues.size > 0 ? (
            <XCircle onClick={onReset} />
          ) : (
            <PlusCircle />
          )}
          {title}
          {selectedLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 ml-1">
              {selectedLabels.map((label) => (
                <Badge key={label} variant="secondary" className="px-1 text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-50 p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${title}`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => onItemSelect(option)}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 border rounded-sm mr-2 flex items-center justify-center",
                        isSelected
                          ? "bg-primary"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Check />
                    </div>
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={onReset} className="justify-center">
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
