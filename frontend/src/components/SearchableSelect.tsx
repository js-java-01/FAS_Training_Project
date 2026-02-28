"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface SearchableSelectOption<T = any> {
  value: string
  label: string
  raw?: T
}

interface SearchableSelectProps<T = any> {
  label?: string
  placeholder?: string
  value?: string
  onChange: (value: string, option?: SearchableSelectOption<T>) => void
  options: SearchableSelectOption<T>[]
  className?: string
  emptyText?: string
  disabled?: boolean
  renderOption?: (option: SearchableSelectOption<T>) => React.ReactNode
}

export function SearchableSelect<T>({
  label,
  placeholder,
  value,
  onChange,
  options,
  className,
  emptyText = "No data found",
  disabled = false,
  renderOption,
}: SearchableSelectProps<T>) {
  const [open, setOpen] = React.useState(false)

  const selected = options.find((opt) => opt.value === value)

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {label && <p className="font-semibold">{label}</p>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-[250px] justify-between"
          >
            {selected ? selected.label : placeholder ?? `Select ${label ?? ""}`}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput
              placeholder={
                label ? `Search ${label}` : "Search..."
              }
            />

            <CommandEmpty>{emptyText}</CommandEmpty>

            <CommandGroup className="max-h-64 overflow-y-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value, option)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />

                  {renderOption ? (
                    renderOption(option)
                  ) : (
                    <span>{option.label}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
