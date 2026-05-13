import { readFile } from 'node:fs/promises';

export async function load() {
  const dataPath = new URL('../lib/data/redbull.json', import.meta.url);

  let redbull = [];
  try {
    const raw = await readFile(dataPath, 'utf8');
    redbull = JSON.parse(raw);
  } catch (error) {
    console.error('Failed to read src/lib/data/redbull.json in +page.server.js', error);
  }

  return {
    redbull,
  };
}
