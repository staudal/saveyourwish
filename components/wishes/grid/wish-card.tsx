import { Separator } from "@/components/ui/separator";
import { type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";
import { ImageContainer } from "./image-container";
import { WishActions } from "./wish-actions";
import { formatPrice } from "@/components/ui/currency-select";
import { type Currency } from "@/constants";

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
}: WishCardProps) {
  return (
    <div className="flex flex-col h-full rounded-t overflow-hidden">
      <div className="relative">
        <ImageContainer
          wish={wish}
          imageDimensions={imageDimensions}
          setImageDimensions={setImageDimensions}
        />
        <WishActions
          wish={wish}
          onDelete={onDelete}
          onAdjustImage={onAdjustImage}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onEdit={onEdit}
          isFirst={isFirst}
          isLast={isLast}
        />
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
            <p className="text-sm text-muted-foreground">
              {new URL(wish.destinationUrl).host.replace("www.", "")}
            </p>
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
