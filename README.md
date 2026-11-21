## RedBull Map

How much will an 8oz RedBull run you in NYC? Explore my evolving database to find out

## Refresh data from Google Sheets

From the project root, run:

```bash
node fetch-data.js
```

This fetches the latest rows from the Google Sheets endpoint and writes them to:

- `src/lib/data/redbull.json`