// Deploy dist/ to an AWS S3 static-site bucket on the commercial partition.
// Usage:
//   HELM_S3_BUCKET=helm-1seansean1 node scripts/deploy-s3.mjs
//
// Optional:
//   AWS_PROFILE=default        (default: 'default')
//   AWS_REGION=us-east-1       (default: 'us-east-1')
//   HELM_DISTRIBUTION_ID=Exxxx (if set, also creates a CloudFront invalidation)

import { execSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const BUCKET = process.env.HELM_S3_BUCKET;
if (!BUCKET) {
  console.error("ERROR: set HELM_S3_BUCKET to the target bucket name.");
  process.exit(1);
}
const PROFILE = process.env.AWS_PROFILE ?? "default";
const REGION = process.env.AWS_REGION ?? "us-east-1";
const DIST_ID = process.env.HELM_DISTRIBUTION_ID;
const ROOT = "dist";

const sh = (cmd) => {
  console.log("→", cmd);
  execSync(cmd, { stdio: "inherit" });
};

// Walk dist/
function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

const files = [...walk(ROOT)];
console.log(`Uploading ${files.length} files to s3://${BUCKET}/ via profile=${PROFILE} region=${REGION}`);

// Cache policy:
//   - Long-cache the immutable hashed assets in /assets/
//   - Never cache html / manifest / sw / index entry — needs to update
const LONG = "public,max-age=31536000,immutable";
const SHORT = "public,max-age=0,must-revalidate";

function cacheFor(path) {
  if (path.includes(`${sep}assets${sep}`)) return LONG;
  if (path.endsWith(".html")) return SHORT;
  if (path.endsWith(".webmanifest")) return SHORT;
  if (path.endsWith("sw.js") || path.includes("workbox-")) return SHORT;
  if (path.endsWith("registerSW.js")) return SHORT;
  return SHORT;
}

function contentTypeFor(path) {
  if (path.endsWith(".html")) return "text/html; charset=utf-8";
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  if (path.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (path.endsWith(".webmanifest")) return "application/manifest+json";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".txt")) return "text/plain; charset=utf-8";
  return "application/octet-stream";
}

for (const local of files) {
  const key = relative(ROOT, local).replaceAll(sep, "/");
  const cmd = [
    "aws",
    "s3",
    "cp",
    `"${local}"`,
    `"s3://${BUCKET}/${key}"`,
    `--profile ${PROFILE}`,
    `--region ${REGION}`,
    `--cache-control "${cacheFor(local)}"`,
    `--content-type "${contentTypeFor(local)}"`,
  ].join(" ");
  sh(cmd);
}

console.log("\nUpload complete.");
console.log(`Public URL (if bucket has website hosting enabled):`);
console.log(`  http://${BUCKET}.s3-website-${REGION}.amazonaws.com/`);
console.log(`Object URL (always works):`);
console.log(`  https://${BUCKET}.s3.${REGION}.amazonaws.com/index.html`);

if (DIST_ID) {
  sh(
    `aws cloudfront create-invalidation --distribution-id ${DIST_ID} --paths "/*" --profile ${PROFILE}`,
  );
}
