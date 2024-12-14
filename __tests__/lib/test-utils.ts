import { parse } from "node-html-parser";
import { MinimalDocument } from "@/lib/fetchers/types";

export function setupTestEnv() {
  return {
    createMockDocument: (html: string): MinimalDocument => {
      const root = parse(html);

      return {
        querySelector: (sel: string) => root.querySelector(sel),
        querySelectorAll: (sel: string) =>
          Array.from(root.querySelectorAll(sel)),
        getElementsByTagName: (tag: string) =>
          Array.from(root.getElementsByTagName(tag)),
        documentElement: {
          lang: root.getAttribute("lang") || "",
          outerHTML: root.toString(),
        },
        URL: "https://test.com",
      };
    },
  };
}
