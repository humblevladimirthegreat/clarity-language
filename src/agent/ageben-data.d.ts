/** Virtual module the bundle build fills in ([agent-bundle.ts](../../scripts/lib/agent-bundle.ts)). */
declare module "ageben:data" {
  export const publishedCsv: string;
  export const overlaysCsv: string;
  export const compoundsCsv: string;
  export const contextData: {
    index: Omit<import("../parse/llm-prompt.js").ExamplePair, "source">[];
    labelGlosses: [string, string][];
    readers: [string, string][];
  };
}
