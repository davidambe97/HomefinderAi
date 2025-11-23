# Quick Start - JavaScript Playwright Scraper

Simple JavaScript version of the Playwright scraper for quick testing.

## Installation

```bash
cd server
npm install
npx playwright install chromium
```

Note: `fs` is built-in to Node.js, so you don't need to install it separately.

## Usage

### Basic Usage

```bash
# Scrape London (default: 10 listings per site)
npm run scrape:js London

# Scrape with custom max listings
npm run scrape:js "Manchester" 15

# Or run directly
node scripts/scrapeListings.js "Birmingham" 20
```

### Command-Line Arguments

1. **Query** (required): Search location (e.g., "London", "Manchester")
2. **Max Listings** (optional): Maximum listings per site (default: 10)

### Examples

```bash
# Scrape London with 10 listings per site
npm run scrape:js London

# Scrape Manchester with 20 listings per site
npm run scrape:js "Manchester" 20

# Scrape Birmingham with 5 listings per site
npm run scrape:js Birmingham 5
```

## Output

Results are saved to `server/data/listings_<query>_<timestamp>.json`

Example output structure:

```json
{
  "timestamp": "2025-11-23T15:30:00.000Z",
  "query": "London",
  "totalSites": 4,
  "totalListings": 35,
  "results": [
    {
      "site": "Rightmove",
      "count": 10,
      "listings": [
        {
          "title": "3 Bedroom House",
          "price": "£250,000",
          "address": "London, SW1A 1AA",
          "bedrooms": "3 bed",
          "url": "https://www.rightmove.co.uk/...",
          "image": "https://..."
        }
      ]
    }
  ]
}
```

## Sites Supported

- ✅ Rightmove
- ✅ Zoopla
- ✅ OpenRent
- ✅ SpareRoom

## Troubleshooting

If you get errors about missing selectors:
- Sites may have updated their HTML structure
- Check the browser console for actual selectors
- Update the `listingSelector` and `extract` functions in `scrapeListings.js`

## Differences from TypeScript Version

- Simpler structure (JavaScript, not TypeScript)
- Direct execution with `node`
- Easier to modify selectors
- Less type safety but more flexible

