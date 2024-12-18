"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";

import { Wishlist } from "./schema";
import { ColumnHeader } from "./column-header";
import { RowActions } from "./row-actions";
import {
  calculateAveragePrice,
  calculatePriceRange,
  cn,
  convertToUSD,
} from "@/lib/utils";

export const columns: ColumnDef<Wishlist>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <ColumnHeader column={column} title="Title" />,
    cell: ({ row }) => {
      return (
        <span className="truncate font-semibold">{row.getValue("title")}</span>
      );
    },
  },
  {
    accessorKey: "wishCount",
    header: ({ column }) => <ColumnHeader column={column} title="Wishes" />,
    cell: ({ row }) => {
      const count = row.getValue("wishCount") as number;
      return (
        <span
          className={cn("truncate", count === 0 && "text-muted-foreground")}
        >
          {count === 0
            ? "No wishes"
            : `${count} ${count === 1 ? "wish" : "wishes"}`}
        </span>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "averagePrice",
    header: ({ column }) => <ColumnHeader column={column} title="Average" />,
    cell: ({ row }) => {
      const average = calculateAveragePrice(row.original.wishes);
      return (
        <span
          className={cn(
            "whitespace-nowrap",
            !average && "text-muted-foreground"
          )}
        >
          {average
            ? `${average.amount.toFixed(2)} ${average.currency}`
            : "No price data"}
        </span>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    sortingFn: (rowA, rowB) => {
      const avgA = calculateAveragePrice(rowA.original.wishes);
      const avgB = calculateAveragePrice(rowB.original.wishes);

      // Handle cases where one or both rows have no price data
      if (!avgA) return 1;
      if (!avgB) return -1;
      if (!avgA && !avgB) return 0;

      // Convert both amounts to USD for comparison
      const amountAInUSD = convertToUSD(avgA.amount, avgA.currency);
      const amountBInUSD = convertToUSD(avgB.amount, avgB.currency);

      return amountAInUSD - amountBInUSD;
    },
  },
  {
    accessorKey: "priceRange",
    header: () => <span>Range</span>,
    cell: ({ row }) => {
      const wishes = row.original.wishes;
      const range = calculatePriceRange(wishes);
      const validWishes = wishes.filter((wish) => wish.price !== null);

      return (
        <span
          className={cn(
            "truncate",
            (!range || validWishes.length <= 1) && "text-muted-foreground"
          )}
        >
          {validWishes.length <= 1
            ? "Not enough data"
            : range
            ? `${range.min.toFixed(2)} - ${range.max.toFixed(2)} ${
                range.currency
              }`
            : "No price data"}
        </span>
      );
    },
  },
  {
    accessorKey: "shared",
    header: ({ column }) => <ColumnHeader column={column} title="Sharing" />,
    cell: ({ row }) => (
      <Badge variant={row.getValue("shared") ? "default" : "secondary"}>
        {row.getValue("shared") ? "Shared" : "Not shared"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <RowActions row={row} />
      </div>
    ),
  },
];
