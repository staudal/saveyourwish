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

export function DynamicBreadcrumb() {
  const pathname = usePathname(); // Get current path
  const segments = pathname
    .split("/")
    .filter((segment) => segment && segment !== "dashboard"); // Exclude "dashboard"

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const url = "/" + segments.slice(0, index + 1).join("/");

          return (
            <BreadcrumbItem key={url}>
              {isLast ? (
                <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink href={url}>
                    {formatSegment(segment)}
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Helper function to format the breadcrumb text
function formatSegment(segment: string) {
  return segment
    .replace(/-/g, " ") // Replace hyphens with spaces
    .replace(/^\w/, (c) => c.toUpperCase()); // Capitalize first letter
}
