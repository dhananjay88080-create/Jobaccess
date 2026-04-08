import "dotenv/config";
import { importFromSafeSources } from "@/lib/import-jobs";

async function main() {
  const summary = await importFromSafeSources();
  console.log("Safe source sync summary:", summary);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
