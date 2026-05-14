import redbull from '$lib/data/redbull.json';

export async function load() {
  // Importing the JSON directly ensures Vite inlines the data at build
  // time so the static build and GitHub Pages deployment include it.
  return { redbull };
}
