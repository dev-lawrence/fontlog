import { createRequire } from 'node:module';
import { statSync } from 'node:fs';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

// argv: node scripts/shot.mjs <input.png> <output-name-without-ext>
const [input, name] = process.argv.slice(2);
if (!input || !name) {
  console.error('usage: node scripts/shot.mjs <input> <output-name>');
  process.exit(1);
}

const out = `src/assets/seen-on/${name}.webp`;
await sharp(input)
  .resize(1600, 1000, { fit: 'cover', position: 'top' })
  .webp({ quality: 80 })
  .toFile(out);
console.log(out, Math.round(statSync(out).size / 1024) + 'KB');
