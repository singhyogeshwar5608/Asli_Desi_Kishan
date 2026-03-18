import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { v2 as cloudinary } from 'cloudinary';

type MediaRecord = {
  originalUrl: string;
  publicId: string;
  secureUrl: string;
  folder: string;
};

type MediaMap = Record<string, MediaRecord>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendRoot = path.resolve(__dirname, '..', '..');
const projectRoot = path.resolve(backendRoot, '..');
const tmpDir = path.resolve(backendRoot, 'tmp');
const mappingPath = path.resolve(tmpDir, 'cloudinary-media-map.json');

const flutterAssetFiles = [
  path.resolve(projectRoot, 'lib', 'data', 'product_catalog.dart'),
  path.resolve(projectRoot, 'lib', 'widgets', 'hero_banner.dart'),
];

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_UPLOAD_FOLDER } =
  process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('❌ Missing Cloudinary credentials. Please set CLOUDINARY_* vars in backend/.env');
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const targetFolder = CLOUDINARY_UPLOAD_FOLDER ?? 'netshop_flutter/products';

async function ensureTmpDir() {
  await fs.mkdir(tmpDir, { recursive: true });
}

async function loadExistingMap(): Promise<MediaMap> {
  try {
    const raw = await fs.readFile(mappingPath, 'utf-8');
    return JSON.parse(raw) as MediaMap;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

async function saveMap(map: MediaMap) {
  await ensureTmpDir();
  await fs.writeFile(mappingPath, JSON.stringify(map, null, 2));
}

async function gatherUrls(): Promise<string[]> {
  const urls = new Set<string>();
  for (const file of flutterAssetFiles) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const regex = /['"](https?:\/\/[^'"\s]+)['"]/g;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(content)) !== null) {
        const url = match[1];
        if (url.startsWith('https://') || url.startsWith('http://')) {
          urls.add(url);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Skipping ${file}: ${(error as Error).message}`);
    }
  }
  return [...urls];
}

async function uploadUrl(url: string) {
  console.log(`⬆️  Uploading ${url}`);
  const response = await cloudinary.uploader.upload(url, {
    folder: targetFolder,
    unique_filename: true,
    overwrite: false,
    resource_type: 'image',
  });
  return {
    originalUrl: url,
    publicId: response.public_id,
    secureUrl: response.secure_url,
    folder: response.folder ?? targetFolder,
  } satisfies MediaRecord;
}

async function main() {
  const urls = await gatherUrls();
  if (!urls.length) {
    console.log('No remote URLs found in Flutter assets. Nothing to upload.');
    return;
  }

  const map = await loadExistingMap();
  const pending = urls.filter((url) => !map[url]);

  if (!pending.length) {
    console.log('✅ All asset URLs already uploaded. Nothing to do.');
    return;
  }

  console.log(`Found ${urls.length} unique URLs (${pending.length} pending uploads).`);

  for (const url of pending) {
    try {
      const record = await uploadUrl(url);
      map[url] = record;
      await saveMap(map);
      console.log(`✅ Uploaded ${url} → ${record.secureUrl}`);
    } catch (error) {
      console.error(`❌ Failed to upload ${url}:`, (error as Error).message);
    }
  }

  console.log(`\n📁 Mapping saved to ${mappingPath}\n`);
}

main().catch((error) => {
  console.error('Unexpected error during upload process', error);
  process.exit(1);
});
