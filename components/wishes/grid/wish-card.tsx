import { type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";
import { ImageContainer } from "./image-container";
import { formatPrice } from "@/components/ui/currency-select";
import { cn } from "@/lib/utils";
import { WishActions } from "./wish-actions";
import { type Currency } from "@/constants";
import { Separator } from "@/components/ui/separator";
import { ExternalLink } from "lucide-react";

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
      className={cn(
        "relative group border rounded-lg overflow-hidden flex flex-col h-full",
        isReordering &&
          "drag-handle cursor-grab active:cursor-grabbing border-dashed border-primary/50"
      )}
    >
      <div className="absolute left-2 top-2 z-10">
        <div className="min-w-8 h-8 bg-white rounded-lg border shadow-sm flex items-center justify-center px-2">
          <span className="text-sm font-medium">x{wish.quantity}</span>
        </div>
      </div>

      {!readonly && !isReordering && onDelete && onAdjustImage && onEdit && (
        <WishActions
          wish={wish}
          onDelete={onDelete}
          onAdjustImage={onAdjustImage}
          onEdit={onEdit}
        />
      )}

      {wish.imageUrl && (
        <ImageContainer
          wish={wish}
          imageDimensions={imageDimensions}
          setImageDimensions={setImageDimensions}
        />
      )}

      <div className="flex flex-col flex-grow">
        <div className="p-4 flex-grow">
          <h3 className="font-semibold">{wish.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {wish.description || "No description"}
          </p>
        </div>

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
          {wish.price && (
            <span className="text-xs text-muted-foreground">
              {formatPrice(wish.price, wish.currency as Currency)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
