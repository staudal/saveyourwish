import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Currency, CURRENCIES } from "@/constants";

interface CurrencySelectProps {
  value: Currency;
  onValueChange: (value: Currency) => void;
}

export function CurrencySelect({ value, onValueChange }: CurrencySelectProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange as (value: string) => void}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((currency) => (
          <SelectItem key={currency.value} value={currency.value}>
            {currency.label} ({currency.symbol})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function formatPrice(price: number, currency: Currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}
