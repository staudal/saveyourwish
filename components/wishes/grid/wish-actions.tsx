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
import { useState } from "react";

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
    setOpen(false); // Force close the dropdown
    // Small delay to ensure dropdown is closed before opening dialog
    setTimeout(() => action(wish), 0);
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
          <DropdownMenuItem onClick={() => handleAction(onEdit)}>
            <PencilIcon className="h-4 w-4 mr-2" />
            <span>Edit</span>
          </DropdownMenuItem>
          {wish.imageUrl && (
            <DropdownMenuItem onClick={() => handleAction(onAdjustImage)}>
              <Move className="h-4 w-4 mr-2" />
              <span>Adjust image</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => handleAction(onDelete)}>
            <Trash2Icon className="h-4 w-4 mr-2" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
