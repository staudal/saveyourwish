"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { type Currency, CURRENCIES } from "@/constants";
import { useMediaQuery } from "@/hooks/use-media-query";

interface CurrencySelectProps {
  value: Currency;
  onValueChange: (value: Currency) => void;
  className?: string;
  disabled?: boolean;
}

function CurrencyList({
  setOpen,
  onValueChange,
  value,
}: {
  setOpen: (open: boolean) => void;
  onValueChange: (value: Currency) => void;
  value: Currency;
}) {
  return (
    <Command>
      <CommandInput placeholder="Search currency..." autoFocus />
      <CommandList>
        <CommandEmpty>No currency found.</CommandEmpty>
        <CommandGroup>
          {CURRENCIES.map((currency) => (
            <CommandItem
              key={currency.value}
              value={currency.value}
              onSelect={(currentValue) => {
                onValueChange(currentValue as Currency);
                setOpen(false);
              }}
            >
              {currency.value}
              <Check
                className={cn(
                  "ml-auto h-4 w-4",
                  value === currency.value ? "opacity-100" : "opacity-0"
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function CurrencySelect({
  value,
  onValueChange,
  className,
  disabled,
}: CurrencySelectProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-[130px] justify-between", className)}
            disabled={disabled}
          >
            {value}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <CurrencyList
            setOpen={setOpen}
            onValueChange={onValueChange}
            value={value}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[130px] justify-between", className)}
          disabled={disabled}
        >
          {value}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <CurrencyList
            setOpen={setOpen}
            onValueChange={onValueChange}
            value={value}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function formatPrice(price: number, currency: Currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}
