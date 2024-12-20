"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { searchUnsplash, UnsplashSearchResponse } from "@/lib/unsplash";
import toast from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UnsplashImagePickerProps {
  onSelect: (
    imageUrl: string,
    unsplashId: string,
    downloadLocation: string,
    userName: string
  ) => void;
  selectedImage: {
    url: string;
    unsplashId?: string;
    user?: {
      name: string;
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

  useEffect(() => {
    if (selectedImage) {
      setImages([]);
      setQuery("");
    }
  }, [selectedImage]);

  const fetchImages = useCallback(
    async (isNewSearch: boolean) => {
      if (!query.trim()) {
        toast.error("Please enter a search term");
        return;
      }

      setIsLoading(true);
      const currentPage = isNewSearch ? 1 : page;
      try {
        const response = await searchUnsplash(
          query,
          currentPage,
          IMAGES_PER_PAGE
        );
        setImages((prev) =>
          isNewSearch ? response.results : [...prev, ...response.results]
        );
        setHasMore(response.total_pages > currentPage);
        if (isNewSearch) {
          setPage(1);
        }
        if (isNewSearch && response.results.length === 0) {
          toast.error("No images found");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to search images");
      } finally {
        setIsLoading(false);
      }
    },
    [query, page]
  );

  const loadMore = async () => {
    setIsLoading(true);
    const nextPage = page + 1;
    try {
      const response = await searchUnsplash(query, nextPage, IMAGES_PER_PAGE);
      setImages((prev) => [...prev, ...response.results]);
      setHasMore(response.total_pages > nextPage);
      setPage(nextPage);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load more images");
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
                fetchImages(true);
              }
            }}
          />
          <Button
            type="button"
            onClick={() => fetchImages(true)}
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
                      image.user.name
                    )
                  }
                >
                  <Image
                    src={image.urls.small}
                    alt="Unsplash photo"
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
                  onClick={loadMore}
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
