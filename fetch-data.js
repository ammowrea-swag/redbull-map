import { writeFile } from 'node:fs/promises';

const apiURL =
  'https://script.google.com/macros/s/AKfycbx7I7qHsstg3hqSRbOnB7akkoyesrXPP7M93hZHVO0amBOfu6ggEMbLZYwpwPsg_kmU/exec';

async function getSheetsData() {
  try {
    const response = await fetch(apiURL);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    console.log('Fetched rows:', data);

    // Save raw data for the app to use
    await writeFile(
    'src/lib/data/redbull.json',
      JSON.stringify(data, null, 2),
      'utf8'
    );

    console.log('Saved to src/lib/data/redbull.json');
  } catch (error) {
    console.error('Error fetching data:', error);
    process.exitCodes = 1;
  }
}

getSheetsData();