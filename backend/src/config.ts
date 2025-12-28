import path from 'path';
import fs from 'fs';

const rootDataDir = process.env.FOTU_DATA_DIR || '/data/fotu';
const cacheDir = path.join(rootDataDir, '.cache');

export const config = {
    rootDataDir: path.resolve(rootDataDir),
    cacheDir: path.resolve(cacheDir),
    thumbsDir: path.join(cacheDir, 'thumbs'),
    previewsDir: path.join(cacheDir, 'previews'),
    albumsDir: path.join(rootDataDir, 'albums'),
    port: parseInt(process.env.PORT || '3000', 10),
};

// Ensure directories exist
const ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
};

export const initializeStorage = () => {
    console.log(`Initializing storage at: ${config.rootDataDir}`);
    ensureDir(config.rootDataDir);
    ensureDir(config.cacheDir);
    ensureDir(config.thumbsDir);
    ensureDir(config.previewsDir);
    ensureDir(config.albumsDir);
};
