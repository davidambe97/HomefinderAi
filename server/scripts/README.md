# Playwright Scraper Script

A Node.js script using Playwright to scrape property listings from Rightmove, Zoopla, OpenRent, and SpareRoom with human-like behavior to avoid detection.

## Installation

First, install Playwright browsers:

```bash
cd server
npm install
npx playwright install chromium
```

## Usage

### Basic Usage

```bash
npm run scrape "London" rightmove
```

### Advanced Usage

```bash
# Scrape Zoopla with custom settings
npm run scrape "Manchester" zoopla --max-listings 15 --output manchester-listings.json

# Scrape OpenRent with visible browser (for debugging)
npm run scrape "Birmingham" openrent --headless false

# Scrape SpareRoom
npm run scrape "Leeds" spareroom --max-listings 10
```

### Command-Line Arguments

- `query` (required): Search query (e.g., "London", "Manchester")
- `site` (required): Site to scrape (`rightmove`, `zoopla`, `openrent`, `spareroom`)
- `--max-listings <number>`: Maximum listings to extract (default: 20)
- `--output <filename>`: Output JSON filename (default: `listings-<site>-<timestamp>.json`)
- `--headless <true|false>`: Run in headless mode (default: true)

## Output

The script saves extracted listings to `server/data/<output-file>.json` with the following structure:

```json
{
  "timestamp": "2025-11-23T15:30:00.000Z",
  "totalListings": 15,
  "listings": [
    {
      "id": "rightmove-12345678",
      "title": "3 Bedroom House",
      "price": 250000,
      "location": "London, SW1A 1AA",
      "city": "London",
      "state": "SW1A 1AA",
      "bedrooms": 3,
      "bathrooms": 2,
      "propertyType": "Unknown",
      "images": ["https://..."],
      "source": "Rightmove",
      "url": "https://www.rightmove.co.uk/properties/12345678"
    }
  ]
}
```

## Features

- **Human-like behavior**: Random delays, slow scrolling, realistic viewport
- **Anti-detection**: Stealth mode, realistic user-agent, no automation flags
- **Error handling**: Graceful handling of missing elements, network errors, page load failures
- **Lazy loading support**: Automatically scrolls to trigger lazy-loaded content
- **Deduplication**: Skips duplicate listings based on URL
- **Comprehensive logging**: Detailed logs for debugging and monitoring

## Error Handling

The script handles:
- Page load failures (30s timeout)
- Missing DOM elements (continues with next listing)
- Network errors (retries with delays)
- Site structure changes (logs warnings)

## Notes

- The script mimics normal user behavior with random delays between actions
- It scrolls slowly to trigger lazy-loaded images and listings
- Selectors may need adjustment if site structures change
- For production use, consider adding rate limiting and proxy rotation

