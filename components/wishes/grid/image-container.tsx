import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";

type Wish = InferSelectModel<typeof wishes>;

interface ImageDimension {
  imageRatio: number;
  isImageTallerThanContainer: boolean;
}

interface ImageContainerProps {
  wish: Wish;
  imageDimensions: Record<string, ImageDimension>;
  setImageDimensions: React.Dispatch<
    React.SetStateAction<Record<string, ImageDimension>>
  >;
}

const getTranslateX = (wish: Wish, dimensions?: ImageDimension) => {
  if (!dimensions) return 0;
  const containerRatio = 16 / 9;
  const isImageWiderThanContainer = dimensions.imageRatio > containerRatio;

  if (!isImageWiderThanContainer && (wish.imageZoom ?? 1) <= 1) return 0;
  const overflow = isImageWiderThanContainer
    ? (dimensions.imageRatio / containerRatio - 1) * 100
    : ((wish.imageZoom ?? 1) - 1) * 100;
  return (((wish.horizontalPosition ?? 50) - 50) / 50) * (overflow / 2);
};

const getTranslateY = (wish: Wish, dimensions?: ImageDimension) => {
  if (!dimensions) return 0;
  const containerRatio = 16 / 9;
  const isImageTallerThanContainer = dimensions.imageRatio < containerRatio;

  if (!isImageTallerThanContainer && (wish.imageZoom ?? 1) <= 1) return 0;
  let overflow;
  if (isImageTallerThanContainer) {
    const imageRatioValue = dimensions.imageRatio;
    overflow = (imageRatioValue / containerRatio - 1) * 100;
  } else {
    overflow = ((wish.imageZoom ?? 1) - 1) * 100;
  }
  return (((wish.verticalPosition ?? 50) - 50) / 50) * (overflow / 2);
};

export function ImageContainer({
  wish,
  imageDimensions,
  setImageDimensions,
}: ImageContainerProps) {
  if (!wish.imageUrl) return null;

  return (
    <div className="w-full overflow-hidden">
      <AspectRatio ratio={16 / 9}>
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <Image
            src={wish.imageUrl}
            alt={wish.title}
            className="absolute"
            width={1000}
            height={1000}
            style={{
              width: imageDimensions[wish.id]?.isImageTallerThanContainer
                ? "100%"
                : "auto",
              height: imageDimensions[wish.id]?.isImageTallerThanContainer
                ? "auto"
                : "100%",
              transform: `
                translate(
                  ${getTranslateX(wish, imageDimensions[wish.id])}%,
                  ${getTranslateY(wish, imageDimensions[wish.id])}%
                )
                scale(${wish.imageZoom ?? 1})
              `,
              transformOrigin: "center",
            }}
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              const imageRatio = img.naturalWidth / img.naturalHeight;
              const containerRatio = 16 / 9;
              const isImageTallerThanContainer = imageRatio < containerRatio;
              setImageDimensions((prev) => ({
                ...prev,
                [wish.id]: {
                  imageRatio,
                  isImageTallerThanContainer,
                },
              }));
            }}
          />
        </div>
      </AspectRatio>
    </div>
  );
}
