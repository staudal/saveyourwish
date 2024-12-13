import { JSDOM } from "jsdom";
import { beforeEach } from "vitest";

export function setupTestEnv() {
  let dom: JSDOM;

  beforeEach(() => {
    dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    global.document = dom.window.document;
    global.window = dom.window as any;
  });

  return {
    createMockDocument: (html: string): Document => {
      document.body.innerHTML = html;
      return document;
    },
  };
}
