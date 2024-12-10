import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Currency, CURRENCY_VALUES } from "@/constants";

interface CurrencySelectProps {
  value: (typeof CURRENCY_VALUES)[number];
  onValueChange: (value: (typeof CURRENCY_VALUES)[number]) => void;
  className?: string;
  disabled?: boolean;
}

export function CurrencySelect({
  value,
  onValueChange,
  className,
  disabled,
}: CurrencySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {CURRENCY_VALUES.map((currency) => (
          <SelectItem key={currency} value={currency}>
            {currency}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
