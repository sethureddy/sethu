import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestDir = join(projectRoot, "teams-app-manifest");
const packageDir = join(projectRoot, "teams-app-package");
const manifestPath = join(manifestDir, "manifest.json");
const appId = process.env.MICROSOFT_APP_ID || process.env.TEAMS_BOT_ID;

if (!appId) {
  console.error("Set MICROSOFT_APP_ID or TEAMS_BOT_ID to your Azure Bot App ID before packaging.");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.id = process.env.TEAMS_APP_PACKAGE_ID || randomUUID();
manifest.bots[0].botId = appId;

mkdirSync(packageDir, { recursive: true });
writeFileSync(join(packageDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
writePng(join(packageDir, "color.png"), 192, 192, (x, y) => {
  const dx = x - 96;
  const dy = y - 96;
  const inside = Math.sqrt(dx * dx + dy * dy) < 78;
  if (!inside) return [255, 255, 255, 0];
  return x < 96 ? [37, 99, 235, 255] : [20, 184, 166, 255];
});
writePng(join(packageDir, "outline.png"), 32, 32, (x, y) => {
  const border = x <= 3 || y <= 3 || x >= 28 || y >= 28 || Math.abs(x - y) <= 1;
  return border ? [255, 255, 255, 255] : [255, 255, 255, 0];
});

copyFileSync(join(packageDir, "manifest.json"), join(manifestDir, "manifest.generated.json"));
console.log(`Teams package files created in ${packageDir}`);
console.log("Zip manifest.json, color.png, and outline.png from that folder before uploading to Teams.");

function writePng(path, width, height, pixelAt) {
  const raw = Buffer.alloc((width * 4 + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a] = pixelAt(x, y);
      const offset = row + 1 + x * 4;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
      raw[offset + 3] = a;
    }
  }

  const chunks = [
    chunk("IHDR", Buffer.concat([
      uint32(width),
      uint32(height),
      Buffer.from([8, 6, 0, 0, 0])
    ])),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0))
  ];

  writeFileSync(path, Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    ...chunks
  ]));
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  return Buffer.concat([
    uint32(data.length),
    typeBuffer,
    data,
    uint32(crc32(Buffer.concat([typeBuffer, data])))
  ]);
}

function uint32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0);
  return buffer;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
