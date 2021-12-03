import fs, { fdatasync } from "fs";
import path from "path";
import { promisify } from "util";

async function main() {
  await fs.promises.copyFile("README.md", path.join("dist", "README.md"));
  // Read package.json
  const package_json = JSON.parse(await fs.promises.readFile("package.json", "utf8"));
  // Remove dev dependencies
  delete package_json.devDependencies;
  // Set to public
  package_json.private = false;
  // Write package.json
  await fs.promises.writeFile("dist/package.json", JSON.stringify(package_json, null, 2));
}

main().catch((error) => console.error(error || error.message));
