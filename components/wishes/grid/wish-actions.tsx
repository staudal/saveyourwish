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
import { useTranslations } from "@/hooks/use-translations";

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
  const t = useTranslations();

  return (
    <div className="absolute right-2 top-2 z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>{t.wishes.actions.manage}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onEdit(wish)}>
            <PencilIcon className="h-4 w-4 mr-2" />
            <span>{t.wishes.actions.edit.button}</span>
          </DropdownMenuItem>
          {wish.imageUrl && (
            <DropdownMenuItem onClick={() => onAdjustImage(wish)}>
              <Move className="h-4 w-4 mr-2" />
              <span>{t.wishes.actions.adjustImage.button}</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onDelete(wish)}>
            <Trash2Icon className="h-4 w-4 mr-2" />
            <span>{t.wishes.actions.delete.button}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
