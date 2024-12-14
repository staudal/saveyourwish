import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PencilIcon, Trash2Icon, Move } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";

type Wish = InferSelectModel<typeof wishes>;

interface WishActionsProps {
  wish: Wish;
  onDelete: (wish: Wish) => void;
  onAdjustImage: (wish: Wish) => void;
  onEdit: (wish: Wish) => void;
}

export function WishActions({
  wish,
  onDelete,
  onAdjustImage,
  onEdit,
}: WishActionsProps) {
  const [open, setOpen] = useState(false);

  const handleAction = (action: (wish: Wish) => void) => {
    setOpen(false); // Close dropdown before triggering action
    action(wish);
  };

  return (
    <div className="absolute right-2 top-2 z-10">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Manage</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => handleAction(onEdit)}>
            <PencilIcon className="h-4 w-4 mr-2" />
            <span>Edit</span>
          </DropdownMenuItem>
          {wish.imageUrl && (
            <DropdownMenuItem onSelect={() => handleAction(onAdjustImage)}>
              <Move className="h-4 w-4 mr-2" />
              <span>Adjust image</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => handleAction(onDelete)}>
            <Trash2Icon className="h-4 w-4 mr-2" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
