"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getWishlist } from "@/actions/wishlist";

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const [segments, setSegments] = useState<string[]>([]);

  useEffect(() => {
    async function processSegments() {
      const rawSegments = pathname
        .split("/")
        .filter((segment) => segment && segment !== "dashboard");

      // Check if we're in a wishlist route
      if (rawSegments[0] === "wishlists" && rawSegments[1]) {
        const wishlist = await getWishlist(rawSegments[1]);
        if (wishlist) {
          // Replace the ID with the title
          rawSegments[1] = wishlist.title;
        }
      }

      setSegments(rawSegments);
    }

    processSegments();
  }, [pathname]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => (
          <React.Fragment key={segment}>
            <BreadcrumbItem>
              {index === segments.length - 1 ? (
                <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={
                    "/dashboard/" +
                    pathname
                      .split("/")
                      .slice(1, index + 2)
                      .join("/")
                  }
                >
                  {formatSegment(segment)}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < segments.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function formatSegment(segment: string) {
  return segment.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
