import { type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";
import { ImageContainer } from "./image-container";
import { formatPrice } from "@/components/ui/currency-select";
import { cn } from "@/lib/utils";
import { WishActions } from "./wish-actions";
import { type Currency } from "@/constants";
import { Separator } from "@/components/ui/separator";
import { ExternalLink } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Wish = InferSelectModel<typeof wishes>;

interface ImageDimension {
  imageRatio: number;
  isImageTallerThanContainer: boolean;
}

interface WishCardProps {
  wish: Wish;
  isReordering?: boolean;
  readonly?: boolean;
  imageDimensions: Record<string, ImageDimension>;
  setImageDimensions: React.Dispatch<
    React.SetStateAction<Record<string, ImageDimension>>
  >;
  onDelete?: (wish: Wish) => void;
  onAdjustImage?: (wish: Wish) => void;
  onEdit?: (wish: Wish) => void;
}

export function WishCard({
  wish,
  isReordering,
  readonly,
  imageDimensions,
  setImageDimensions,
  onDelete,
  onAdjustImage,
  onEdit,
}: WishCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: wish.id,
    disabled: !isReordering,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatUrl = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative group border rounded-lg overflow-hidden flex flex-col h-full",
        isReordering &&
          "cursor-grab active:cursor-grabbing border-dashed border-primary/50",
        isDragging && "opacity-75 border-primary shadow-lg"
      )}
    >
      {!readonly && !isReordering && onDelete && onAdjustImage && onEdit && (
        <WishActions
          wish={wish}
          onDelete={onDelete}
          onAdjustImage={onAdjustImage}
          onEdit={onEdit}
        />
      )}

      <div className="flex flex-col flex-grow">
        <div className="p-4 flex-grow">
          <h3 className="font-semibold">{wish.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {wish.description || "No description"}
          </p>
        </div>

        {!isReordering && (
          <>
            {wish.imageUrl && (
              <ImageContainer
                wish={wish}
                imageDimensions={imageDimensions}
                setImageDimensions={setImageDimensions}
              />
            )}

            <Separator orientation="horizontal" />
            <div className="p-4 flex justify-between items-center">
              {wish.destinationUrl ? (
                <a
                  href={wish.destinationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>{formatUrl(wish.destinationUrl)}</span>
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">No link</span>
              )}
              {wish.quantity && (
                <span className="text-xs text-muted-foreground">
                  x{wish.quantity}
                </span>
              )}
              {wish.price && (
                <span className="text-xs text-muted-foreground">
                  {formatPrice(wish.price, wish.currency as Currency)}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
