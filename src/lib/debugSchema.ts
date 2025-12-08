
import { getDbV2 } from "@/lib/db/v2";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function debugSchema() {
  const db = await getDbV2();
  const cat = await db.collection("expenseCategories").findOne({});
  const content = JSON.stringify(cat, null, 2);
  const path = join(process.cwd(), "debug_category_schema.txt");
  await writeFile(path, content);
  console.log("Debug schema written to", path);
}
