import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import crypto from 'crypto';
import { connectDb, disconnectDb } from '@config/database';
import { ProductModel } from '@modules/products/product.model';

interface CatalogProduct {
  category: string;
  brand: string;
  rating: number;
  popularityScore: number;
  publishedAt: Date;
  product: {
    id: string;
    title: string;
    price: number;
    totalPrice: number;
    bv: number;
    imageUrl: string;
    description: string;
  };
}

interface MediaRecord {
  secureUrl: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..', '..');
const projectRoot = path.resolve(backendRoot, '..');
const catalogPath = path.resolve(projectRoot, 'lib', 'data', 'product_catalog.dart');
const mediaMapPath = path.resolve(backendRoot, 'tmp', 'cloudinary-media-map.json');

const PRODUCT_ENTRY_TOKEN = 'ProductCatalogEntry(';
const PRODUCT_BLOCK_TOKEN = 'product: Product(';

function extractEntries(source: string): string[] {
  const entries: string[] = [];
  let cursor = source.indexOf(PRODUCT_ENTRY_TOKEN);
  while (cursor !== -1) {
    let depth = 0;
    let i = cursor;
    while (i < source.length) {
      const char = source[i];
      if (char === '(') depth++;
      else if (char === ')') {
        depth--;
        if (depth === 0) {
          entries.push(source.slice(cursor, i + 1));
          break;
        }
      }
      i++;
    }
    cursor = source.indexOf(PRODUCT_ENTRY_TOKEN, i);
  }
  return entries;
}

function matchValue(snippet: string, pattern: RegExp, parser: (value: string) => any = (v) => v) {
  const match = snippet.match(pattern);
  if (!match) return undefined;
  return parser(match[1].trim());
}

function parseDescription(snippet: string) {
  const match = snippet.match(/description:\s*'([\s\S]*?)',\s*\)/);
  if (!match) return '';
  return match[1].replace(/\s+/g, ' ').trim();
}

function parsePublishedAt(snippet: string) {
  const match = snippet.match(/publishedAt:\s*DateTime\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)/);
  if (!match) return new Date();
  const [_, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function extractProductBlock(entry: string): string {
  const start = entry.indexOf(PRODUCT_BLOCK_TOKEN);
  if (start === -1) return '';
  const blockStart = start + PRODUCT_BLOCK_TOKEN.length;
  let depth = 1;
  for (let i = blockStart; i < entry.length; i++) {
    const char = entry[i];
    if (char === '(') depth++;
    else if (char === ')') {
      depth--;
      if (depth === 0) {
        return entry.slice(blockStart, i);
      }
    }
  }
  return '';
}

function parseCatalog(source: string): CatalogProduct[] {
  const entries = extractEntries(source);
  return entries.map((entry) => {
    const productBlock = extractProductBlock(entry);

    return {
      category: matchValue(entry, /category:\s*'([^']+)'/, String) ?? 'General',
      brand: matchValue(entry, /brand:\s*'([^']+)'/, String) ?? 'Unknown',
      rating: matchValue(entry, /rating:\s*([0-9.]+)/, Number) ?? 0,
      popularityScore: matchValue(entry, /popularityScore:\s*(\d+)/, Number) ?? 0,
      publishedAt: parsePublishedAt(entry),
      product: {
        id: matchValue(productBlock, /id:\s*'([^']+)'/, String) ?? crypto.randomUUID(),
        title: matchValue(productBlock, /title:\s*'([^']+)'/, String) ?? 'Untitled Product',
        price: matchValue(productBlock, /price:\s*([0-9.]+)/, Number) ?? 0,
        totalPrice: matchValue(productBlock, /totalPrice:\s*([0-9.]+)/, Number) ?? 0,
        bv: matchValue(productBlock, /bv:\s*(\d+)/, Number) ?? 0,
        imageUrl: matchValue(productBlock, /imageUrl:\s*['"]([^'"\n]+)['"]/, String) ?? '',
        description: parseDescription(productBlock),
      },
    } satisfies CatalogProduct;
  });
}

async function loadMediaMap(): Promise<Record<string, MediaRecord>> {
  try {
    const raw = await fs.readFile(mediaMapPath, 'utf-8');
    return JSON.parse(raw) as Record<string, MediaRecord>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

function generateSku(existing: Set<string>): string {
  let sku = '';
  do {
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    sku = `SKU-${random}`;
  } while (existing.has(sku));
  existing.add(sku);
  return sku;
}

async function seedProducts() {
  await connectDb();

  const source = await fs.readFile(catalogPath, 'utf-8');
  const catalog = parseCatalog(source);
  const mediaMap = await loadMediaMap();
  const skuSet = new Set<string>();

  let created = 0;
  let updated = 0;

  for (const entry of catalog) {
    const legacyTitle = entry.product.title.trim();
    const imageRecord = mediaMap[entry.product.imageUrl];
    const imageUrl = imageRecord?.secureUrl ?? entry.product.imageUrl;

    if (!imageUrl) {
      console.warn(`⚠️  Skipping ${legacyTitle} because imageUrl is missing.`);
      continue;
    }

    const stock = Math.max(25, entry.popularityScore);

    const payload = {
      name: legacyTitle,
      description: entry.product.description,
      actualPrice: entry.product.price,
      totalPrice: entry.product.totalPrice,
      bv: entry.product.bv,
      stock,
      categories: [entry.category],
      images: [
        {
          url: imageUrl,
          alt: legacyTitle,
        },
      ],
      isActive: true,
    };

    const existing = await ProductModel.findOne({ name: legacyTitle });
    if (existing) {
      await ProductModel.updateOne({ _id: existing._id }, payload);
      updated++;
      continue;
    }

    const sku = generateSku(skuSet);
    await ProductModel.create({
      sku,
      ...payload,
    });
    created++;
  }

  await disconnectDb();

  console.log(`Seed complete. Created: ${created}, Updated: ${updated}`);
}

seedProducts().catch(async (error) => {
  console.error('Failed to seed products', error);
  await disconnectDb();
  process.exit(1);
});
