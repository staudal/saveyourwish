"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { columns } from "./wishlists-columns";
import { useRouter } from "next/navigation";
import { Currency } from "@/constants";
import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Wishlist = {
  id: string;
  title: string;
  category: string;
  favorite: boolean;
  wishCount: number;
  wishes: {
    price: number | null;
    currency: Currency;
  }[];
};

export default function WishlistsTable({
  wishlists,
}: {
  wishlists: Wishlist[];
}) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: wishlists,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="w-full overflow-hidden">
      <div className="overflow-x-auto">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "h-10 px-2 text-left align-middle font-medium text-muted-foreground",
                        header.id !== "title" &&
                          header.id !== "actions" &&
                          header.id !== "category" &&
                          "hidden md:table-cell",
                        header.id === "title" && "w-[35%] md:w-auto",
                        header.id === "category" && "w-[25%] md:w-auto",
                        header.id === "actions" &&
                          "!w-[40%] text-right md:w-auto",
                        header.column.getCanSort()
                          ? "cursor-pointer select-none hover:bg-muted/50"
                          : ""
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-2",
                          header.id === "actions" && "justify-end w-full"
                        )}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() ? (
                          header.column.getIsSorted() ? (
                            header.column.getIsSorted() === "desc" ? (
                              <ArrowDown className="h-4 w-4" />
                            ) : (
                              <ArrowUp className="h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                          )
                        ) : null}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={(e) => {
                      // Only navigate if we didn't click a button or link
                      if (!(e.target as HTMLElement).closest("button, a")) {
                        router.push(`/dashboard/wishlists/${row.original.id}`);
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No wishlists found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
