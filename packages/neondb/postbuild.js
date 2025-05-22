import { z } from "zod/v4-mini";
import { schemaSchema } from "./dist/lib/utils/table-schema.js";
import { writeFileSync } from "node:fs";

const jsonSchema = z.toJSONSchema(schemaSchema);

writeFileSync("./dist/schema.json", JSON.stringify(jsonSchema, null, 2));