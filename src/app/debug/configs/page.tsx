
import { getDbV2 } from "@/lib/db/v2";

export default async function DebugConfigsPage() {
  const db = await getDbV2();
  const configs = await db.collection("farmerConfigs").find({}).toArray();
  return (
    <pre>{JSON.stringify(configs, null, 2)}</pre>
  );
}
