// Converts rendered PDF page PNGs into optimized WebP (full + thumb) for the flipbook.
// Source PNGs are rendered via pdftoppm into ~/nh-catalog-build/render.
// Output -> public/pages. Set SRC_DIR env to override the source location.
import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcDir =
  process.env.SRC_DIR || path.join(os.homedir(), "nh-catalog-build", "render");
const outDir = path.resolve(root, "public", "pages");
const thumbDir = path.resolve(root, "public", "pages", "thumbs");
const ogDir = path.resolve(root, "public", "og");

async function main() {
  if (!existsSync(srcDir)) {
    throw new Error(`Source render dir not found: ${srcDir}. Run pdftoppm first.`);
  }
  await mkdir(outDir, { recursive: true });
  await mkdir(thumbDir, { recursive: true });
  await mkdir(ogDir, { recursive: true });

  const files = (await readdir(srcDir))
    .filter((f) => /^page-\d+\.png$/i.test(f))
    .sort();

  if (files.length === 0) throw new Error("No page PNGs found to convert.");

  let i = 0;
  for (const file of files) {
    i += 1;
    const n = String(i).padStart(2, "0");
    const input = path.join(srcDir, file);

    await sharp(input)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 86, effort: 6 })
      .toFile(path.join(outDir, `page-${n}.webp`));

    await sharp(input)
      .resize({ width: 320, withoutEnlargement: true })
      .webp({ quality: 72, effort: 6 })
      .toFile(path.join(thumbDir, `page-${n}.webp`));

    console.log(`✓ page-${n}.webp + thumb`);
  }

  // Social share image from the cover (1200x630, cover centered on brand black).
  const coverPng = path.join(srcDir, files[0]);
  const cover = await sharp(coverPng).resize({ height: 600 }).png().toBuffer();
  await sharp({
    create: { width: 1200, height: 630, channels: 4, background: "#15161a" },
  })
    .composite([{ input: cover, gravity: "center" }])
    .jpeg({ quality: 88 })
    .toFile(path.join(ogDir, "cover.jpg"));
  console.log("✓ og/cover.jpg");

  console.log(`\nDone. ${files.length} pages processed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
