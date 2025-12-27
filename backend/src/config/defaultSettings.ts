import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const CONFIG_PATH = path.join(process.cwd(), 'config.yml');

// Load defaults from YAML file
let defaults: Record<string, string>;

try {
    const fileContents = fs.readFileSync(CONFIG_PATH, 'utf8');
    defaults = yaml.load(fileContents) as Record<string, string>;
} catch (e) {
    console.error(`Failed to load config.yml from ${CONFIG_PATH}`, e);
    // Fallback? Or fail hard? Failing hard is probably safer for "seeding" logic 
    // but let's provide a minimal fallback to avoid crash if file is missing during dev
    defaults = {};
}

export const DEFAULT_SETTINGS = defaults;
