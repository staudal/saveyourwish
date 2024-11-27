import { Separator } from "@/components/ui/separator";
import { type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";
import { ImageContainer } from "./image-container";
import { formatPrice } from "@/components/ui/currency-select";
import { type Currency } from "@/constants";
import {
  MoreHorizontal,
  PencilIcon,
  Move,
  Trash2Icon,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

type Wish = InferSelectModel<typeof wishes>;

interface ImageDimension {
  imageRatio: number;
  isImageTallerThanContainer: boolean;
}

interface WishCardProps {
  wish: Wish;
  imageDimensions: Record<string, ImageDimension>;
  setImageDimensions: React.Dispatch<
    React.SetStateAction<Record<string, ImageDimension>>
  >;
  onDelete: (wish: Wish) => void;
  onAdjustImage: (wish: Wish) => void;
  onMoveUp: (wish: Wish) => void;
  onMoveDown: (wish: Wish) => void;
  onEdit: (wish: Wish) => void;
  isFirst: boolean;
  isLast: boolean;
  readonly?: boolean;
}

export function WishCard({
  wish,
  imageDimensions,
  setImageDimensions,
  onDelete,
  onAdjustImage,
  onMoveUp,
  onMoveDown,
  onEdit,
  isFirst,
  isLast,
  readonly = false,
}: WishCardProps) {
  return (
    <div className="flex flex-col h-full rounded-t overflow-hidden">
      <div className="relative">
        <ImageContainer
          wish={wish}
          imageDimensions={imageDimensions}
          setImageDimensions={setImageDimensions}
        />
        {!readonly && (
          <div className="absolute right-2 top-2 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Manage wish</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(wish)}>
                  <PencilIcon className="h-4 w-4 mr-2" />
                  <span>Edit</span>
                </DropdownMenuItem>
                {wish.imageUrl && (
                  <DropdownMenuItem onClick={() => onAdjustImage(wish)}>
                    <Move className="h-4 w-4 mr-2" />
                    <span>Adjust image</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onDelete(wish)}>
                  <Trash2Icon className="h-4 w-4 mr-2" />
                  <span>Delete</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onMoveUp(wish)}
                  disabled={isFirst}
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  <span>Move up</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onMoveDown(wish)}
                  disabled={isLast}
                >
                  <ArrowDown className="h-4 w-4 mr-2" />
                  <span>Move down</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      <div className="border rounded-b flex flex-col h-full">
        <div className="p-4">
          <div className="font-bold line-clamp-1">{wish.title}</div>
          {wish.description && (
            <p className="text-muted-foreground text-sm line-clamp-3">
              {wish.description}
            </p>
          )}
          <div className="mt-2 space-y-1">
            <p className="text-sm text-muted-foreground">
              Quantity: {wish.quantity}
            </p>
          </div>
        </div>
        <div className="flex-1"></div>
        <Separator orientation="horizontal" />
        <div className="flex justify-between items-center p-4">
          {wish.destinationUrl && (
            <Link
              className="text-sm text-muted-foreground"
              href={wish.destinationUrl}
              target="_blank"
            >
              {new URL(wish.destinationUrl).host.replace("www.", "")}
            </Link>
          )}
          {wish.price && (
            <p className="text-sm text-muted-foreground">
              {formatPrice(wish.price, wish.currency as Currency)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
