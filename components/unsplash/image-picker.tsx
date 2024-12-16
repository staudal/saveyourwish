"use client";

import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { searchUnsplash } from "@/lib/unsplash";
import type { UnsplashSearchResponse } from "@/lib/unsplash";
import toast from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

interface UnsplashImagePickerProps {
  onSelect: (
    imageUrl: string,
    unsplashId: string,
    downloadLocation: string,
    photographer: {
      name: string;
      username: string;
    }
  ) => void;
  selectedImage: {
    url: string;
    unsplashId?: string;
    photographer?: {
      name: string;
      username: string;
    };
  } | null;
  onRemove: () => void;
}

const IMAGES_PER_PAGE = 8;

export function UnsplashImagePicker({
  onSelect,
  selectedImage,
  onRemove,
}: UnsplashImagePickerProps) {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState<UnsplashSearchResponse["results"]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  React.useEffect(() => {
    if (selectedImage) {
      setImages([]);
      setQuery("");
    }
  }, [selectedImage]);

  const searchImages = async (newSearch = false) => {
    if (!query.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setIsLoading(true);
    try {
      const currentPage = newSearch ? 1 : page;
      const response = await searchUnsplash(
        query,
        currentPage,
        IMAGES_PER_PAGE
      );

      setImages((prev) =>
        newSearch ? response.results : [...prev, ...response.results]
      );
      setHasMore(response.total_pages > currentPage);
      if (newSearch) {
        setPage(1);
      }

      if (response.results.length === 0 && newSearch) {
        toast.error("No images found");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to search images");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    try {
      const response = await searchUnsplash(query, nextPage, IMAGES_PER_PAGE);
      setImages((prev) => [...prev, ...response.results]);
      setHasMore(response.total_pages > nextPage);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load more images");
      setPage(page);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!selectedImage && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search Unsplash..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                searchImages(true);
              }
            }}
          />
          <Button
            type="button"
            onClick={() => searchImages(true)}
            disabled={isLoading}
            size="icon"
            className="shrink-0"
          >
            <Search className="h-4 w-4" />
          </Button>
          {query && images.length > 0 && (
            <Button
              type="button"
              size="icon"
              onClick={() => {
                setQuery("");
                setImages([]);
              }}
              variant="outline"
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      <ScrollArea className="h-[300px]" type="always">
        {selectedImage ? (
          <div className="relative h-[300px] rounded-lg overflow-hidden border">
            <Image
              src={selectedImage.url}
              alt="Selected cover"
              className="object-cover"
              fill
            />
            <div className="absolute top-2 left-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-white hover:bg-white hover:cursor-default"
              >
                Selected image
              </Button>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={onRemove}
            >
              Remove
            </Button>
            {selectedImage?.unsplashId && (
              <div className="absolute bottom-2 right-2">
                <a
                  href={`https://unsplash.com/@${selectedImage.photographer?.username}?utm_source=saveyourwish&utm_medium=referral`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white hover:underline bg-black/50 px-2 py-1 rounded-md"
                >
                  Photo by {selectedImage.photographer?.name} on Unsplash
                </a>
              </div>
            )}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground border-2 border-dashed rounded-lg">
            <ImageIcon className="h-8 w-8 mb-2" />
            <p className="text-sm text-center">
              {isLoading ? "Searching..." : "Use the search bar to find images"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {images.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  className="group relative aspect-[3/2] rounded-md bg-muted focus:outline-none overflow-hidden"
                  onClick={() =>
                    onSelect(
                      image.urls.regular,
                      image.id,
                      image.links.download_location,
                      {
                        name: image.user.name,
                        username: image.user.username,
                      }
                    )
                  }
                >
                  <Image
                    src={image.urls.small}
                    alt={`Photo by ${image.user.name} on Unsplash`}
                    className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-md"
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary bg-primary/0 group-hover:bg-primary/10 transition-all duration-200 rounded-md" />
                </button>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pb-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setIsLoading(true);
                    await loadMore();
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? <>Loading...</> : <>Load more images</>}
                </Button>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground text-center pb-4">
              Photos provided by Unsplash
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
