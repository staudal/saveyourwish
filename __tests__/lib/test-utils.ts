import { parse } from "node-html-parser";
import { MinimalDocument } from "@/lib/fetchers/types";

export function setupTestEnv() {
  return {
    createMockDocument: (html: string): MinimalDocument => {
      const root = parse(html);
      return {
        querySelector: (sel: string) => root.querySelector(sel),
        querySelectorAll: (sel: string) => root.querySelectorAll(sel),
        getElementsByTagName: (tag: string) => root.getElementsByTagName(tag),
        documentElement: {
          lang: root.querySelector("html")?.getAttribute("lang") || "",
          outerHTML: root.toString(),
        },
        URL: "https://test.com",
      };
    },
  };
}
