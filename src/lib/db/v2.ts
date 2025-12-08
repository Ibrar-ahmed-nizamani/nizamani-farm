import clientPromise from "@/lib/mongodb";

export async function getDbV2() {
  const client = await clientPromise;
  return client.db("farm-v2");
}
