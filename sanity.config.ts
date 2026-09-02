"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { sanityEnv } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

export default defineConfig({
  name: "jewishOriginalDevelopment",
  title: "Jewish Original Media",
  basePath: "/admin",
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  plugins: [structureTool({ structure })],
  schema: { types: schemaTypes },
});
