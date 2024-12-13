import { headers } from "next/headers";
import { JSDOM, VirtualConsole } from "jsdom";

export const fetchWithHeaders = async (url: string) => {
  return fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Origin: headers().get("origin") || "https://saveyourwish.com",
      Referer: headers().get("referer") || "https://saveyourwish.com",
    },
  });
};

export const createDOM = (html: string) => {
  return new JSDOM(html, {
    runScripts: "outside-only",
    resources: "usable",
    pretendToBeVisual: true,
    virtualConsole: new VirtualConsole().sendTo(console, {
      omitJSDOMErrors: true,
    }),
  });
};
