import { type Wishlist, columns } from "./wishlists-columns";
import { DataTable } from "@/components/tables/data-table";

export default function WishlistsTable({
  wishlists,
}: {
  wishlists: Wishlist[];
}) {
  return <DataTable columns={columns} data={wishlists} />;
}
