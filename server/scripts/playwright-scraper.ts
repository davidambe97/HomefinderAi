/**
 * Playwright-based property scraper
 * Mimics normal browser behavior to avoid anti-scraping detection
 */

import { chromium, Browser, Page } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { PropertyListing } from '../types.js';

interface ScraperConfig {
  query: string;
  site: 'rightmove' | 'zoopla' | 'openrent' | 'spareroom';
  maxListings?: number;
  outputFile?: string;
  headless?: boolean;
}

interface SiteConfig {
  baseUrl: string;
  searchUrl: (query: string) => string;
  selectors: {
    listingContainer: string;
    title: string;
    price: string;
    address: string;
    bedrooms?: string;
    bathrooms?: string;
    image: string;
    link: string;
  };
  waitForSelector?: string;
}

// Site-specific configurations
const SITE_CONFIGS: Record<string, SiteConfig> = {
  rightmove: {
    baseUrl: 'https://www.rightmove.co.uk',
    searchUrl: (query: string) => 
      `https://www.rightmove.co.uk/property-for-sale/find.html?searchType=SALE&locationIdentifier=REGION%5E${encodeURIComponent(query)}&sortType=6`,
    selectors: {
      listingContainer: '.l-searchResults > div[class*="PropertyCard"]',
      title: 'h2[class*="propertyCard-title"]',
      price: '.propertyCard-priceValue',
      address: '.propertyCard-address',
      bedrooms: '.propertyCard-details .noBedrooms',
      bathrooms: '.propertyCard-details .noBathrooms',
      image: '.propertyCard-img img',
      link: 'a.propertyCard-link',
    },
    waitForSelector: '.l-searchResults',
  },
  zoopla: {
    baseUrl: 'https://www.zoopla.co.uk',
    searchUrl: (query: string) => 
      `https://www.zoopla.co.uk/for-sale/property?q=${encodeURIComponent(query)}&sort=newest_listings&premium=true`,
    selectors: {
      listingContainer: 'ul[class*="listing-results"] > li, article[class*="listing"]',
      title: 'h2[class*="listing-title"], a[class*="listing-title"]',
      price: '.listing-price, [data-testid="listing-price"]',
      address: '.listing-address, [data-testid="listing-address"]',
      bedrooms: '.num-beds, [data-testid="listing-beds"]',
      bathrooms: '.num-baths, [data-testid="listing-baths"]',
      image: '.listing-photos img, [data-testid="listing-image"] img',
      link: 'a[class*="listing-link"], a[href*="/for-sale/details/"]',
    },
    waitForSelector: 'ul[class*="listing-results"], article[class*="listing"]',
  },
  openrent: {
    baseUrl: 'https://www.openrent.co.uk',
    searchUrl: (query: string) => 
      `https://www.openrent.co.uk/properties-to-rent?term=${encodeURIComponent(query)}&sort=date`,
    selectors: {
      listingContainer: '.property-list-item, .property-card',
      title: 'h2.property-title, .property-title a',
      price: '.property-price, .price',
      address: '.property-address, .address',
      bedrooms: '.property-beds, .beds',
      bathrooms: '.property-baths, .baths',
      image: '.property-image img, .property-photo img',
      link: 'a.property-link, a[href*="/property/"]',
    },
    waitForSelector: '.property-list-item, .property-card',
  },
  spareroom: {
    baseUrl: 'https://www.spareroom.co.uk',
    searchUrl: (query: string) => 
      `https://www.spareroom.co.uk/flatshare/search.pl?search=${encodeURIComponent(query)}&sort_by=date`,
    selectors: {
      listingContainer: '.listing-result, .room-card',
      title: 'h2.listing-title, .room-title',
      price: '.listing-price, .room-price',
      address: '.listing-address, .room-address',
      bedrooms: '.listing-beds, .room-beds',
      image: '.listing-image img, .room-image img',
      link: 'a.listing-link, a[href*="/room/"]',
    },
    waitForSelector: '.listing-result, .room-card',
  },
};

/**
 * Random delay to mimic human behavior
 */
function randomDelay(min: number = 100, max: number = 500): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Scroll page slowly to trigger lazy loading
 */
async function slowScroll(page: Page, distance: number = 300): Promise<void> {
  await page.evaluate((dist: number) => {
    // @ts-ignore - window is available in browser context
    window.scrollBy(0, dist);
  }, distance);
  await randomDelay(200, 400);
}

/**
 * Extract price from text (e.g., "£250,000" -> 250000)
 */
function extractPrice(priceText: string): number {
  const cleaned = priceText.replace(/[£,\s]/g, '');
  const match = cleaned.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Extract number from text (e.g., "3 bed" -> 3)
 */
function extractNumber(text: string): number | undefined {
  const match = text.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * Generate unique ID from URL and title
 */
function generateId(url: string, title: string, source: string): string {
  const urlMatch = url.match(/\/(\d+)/);
  if (urlMatch) {
    return `${source.toLowerCase()}-${urlMatch[1]}`;
  }
  const hash = url.split('/').pop() || title;
  return `${source.toLowerCase()}-${hash.replace(/[^a-zA-Z0-9]/g, '-')}`;
}

/**
 * Scrape listings from a page
 */
async function scrapeListings(
  page: Page,
  config: SiteConfig,
  source: string,
  maxListings: number = 20
): Promise<PropertyListing[]> {
  const listings: PropertyListing[] = [];
  const seenUrls = new Set<string>();

  try {
    // Wait for listings to load
    if (config.waitForSelector) {
      await page.waitForSelector(config.waitForSelector, { timeout: 10000 });
    }
    
    // Scroll down slowly to trigger lazy loading
    for (let i = 0; i < 3; i++) {
      await slowScroll(page, 500);
    }

    // Wait a bit for content to load
    await randomDelay(1000, 2000);

    // Get all listing containers
    const listingElements = await page.$$(config.selectors.listingContainer);
    console.log(`[Playwright] Found ${listingElements.length} listing containers`);

    for (const element of listingElements) {
      if (listings.length >= maxListings) break;

      try {
        // Extract title
        const titleElement = await element.$(config.selectors.title);
        const title = titleElement 
          ? (await titleElement.textContent())?.trim() || 'Property'
          : 'Property';

        // Extract price
        const priceElement = await element.$(config.selectors.price);
        const priceText = priceElement 
          ? (await priceElement.textContent())?.trim() || '0'
          : '0';
        const price = extractPrice(priceText);

        // Extract address
        const addressElement = await element.$(config.selectors.address);
        const location = addressElement 
          ? (await addressElement.textContent())?.trim() || ''
          : '';

        // Extract bedrooms
        let bedrooms: number | undefined;
        if (config.selectors.bedrooms) {
          const bedroomsElement = await element.$(config.selectors.bedrooms);
          if (bedroomsElement) {
            const bedroomsText = await bedroomsElement.textContent();
            bedrooms = bedroomsText ? extractNumber(bedroomsText) : undefined;
          }
        }

        // Extract bathrooms
        let bathrooms: number | undefined;
        if (config.selectors.bathrooms) {
          const bathroomsElement = await element.$(config.selectors.bathrooms);
          if (bathroomsElement) {
            const bathroomsText = await bathroomsElement.textContent();
            bathrooms = bathroomsText ? extractNumber(bathroomsText) : undefined;
          }
        }

        // Extract image
        const imageElement = await element.$(config.selectors.image);
        let imageUrl = '';
        if (imageElement) {
          const src = await imageElement.getAttribute('src');
          const dataSrc = await imageElement.getAttribute('data-src');
          imageUrl = src || dataSrc || '';
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = config.baseUrl + imageUrl;
          }
        }

        // Extract link
        const linkElement = await element.$(config.selectors.link);
        let url = '';
        if (linkElement) {
          const href = await linkElement.getAttribute('href');
          url = href || '';
          if (url && !url.startsWith('http')) {
            url = config.baseUrl + url;
          }
        }

        // Skip if we've seen this URL or if essential data is missing
        if (!url || seenUrls.has(url) || !title || price === 0) {
          continue;
        }
        seenUrls.add(url);

        const listing: PropertyListing = {
          id: generateId(url, title, source),
          title,
          price,
          location,
          city: location.split(',')[0]?.trim() || '',
          state: location.split(',').slice(1).join(',').trim() || undefined,
          bedrooms,
          bathrooms,
          propertyType: 'Unknown', // Could be extracted if needed
          images: imageUrl ? [imageUrl] : [],
          source,
          url,
        };

        listings.push(listing);
        console.log(`[Playwright] Extracted: ${title} - £${price.toLocaleString()}`);

      } catch (error) {
        console.warn(`[Playwright] Error extracting listing:`, error instanceof Error ? error.message : String(error));
        continue;
      }
    }

  } catch (error) {
    console.error(`[Playwright] Error scraping listings:`, error instanceof Error ? error.message : String(error));
  }

  return listings;
}

/**
 * Main scraper function
 */
async function scrapeWithPlaywright(config: ScraperConfig): Promise<PropertyListing[]> {
  const siteConfig = SITE_CONFIGS[config.site];
  if (!siteConfig) {
    throw new Error(`Unsupported site: ${config.site}`);
  }

  const browser = await chromium.launch({
    headless: config.headless !== false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-GB',
    timezoneId: 'Europe/London',
  });

  // Add stealth features
  await context.addInitScript(() => {
    // @ts-ignore - navigator is available in browser context
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  });

  const page = await context.newPage();

  try {
    console.log(`[Playwright] Navigating to ${config.site}...`);
    const searchUrl = siteConfig.searchUrl(config.query);
    console.log(`[Playwright] Search URL: ${searchUrl}`);

    // Navigate with timeout
    await page.goto(searchUrl, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Random delay to mimic human reading
    await randomDelay(1500, 3000);

    // Scrape listings
    const listings = await scrapeListings(
      page,
      siteConfig,
      config.site.charAt(0).toUpperCase() + config.site.slice(1),
      config.maxListings || 20
    );

    console.log(`[Playwright] ✅ Successfully extracted ${listings.length} listings from ${config.site}`);

    return listings;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Playwright] ❌ Scraping failed:`, errorMessage);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Save listings to JSON file
 */
function saveToJson(listings: PropertyListing[], outputFile: string): void {
  try {
    const outputDir = join(process.cwd(), 'server', 'data');
    mkdirSync(outputDir, { recursive: true });
    
    const filePath = join(outputDir, outputFile);
    const data = {
      timestamp: new Date().toISOString(),
      totalListings: listings.length,
      listings,
    };

    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[Playwright] 💾 Saved ${listings.length} listings to ${filePath}`);
  } catch (error) {
    console.error(`[Playwright] Error saving to JSON:`, error instanceof Error ? error.message : String(error));
  }
}

/**
 * Main entry point
 */
async function main() {
  // Parse command-line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
Usage: tsx playwright-scraper.ts <query> <site> [options]

Arguments:
  query    Search query (e.g., "London", "Manchester")
  site     Site to scrape: rightmove, zoopla, openrent, spareroom

Options:
  --max-listings <number>  Maximum listings to extract (default: 20)
  --output <filename>     Output JSON filename (default: listings-<timestamp>.json)
  --headless <true|false>  Run in headless mode (default: true)

Examples:
  tsx playwright-scraper.ts "London" rightmove
  tsx playwright-scraper.ts "Manchester" zoopla --max-listings 10
  tsx playwright-scraper.ts "Birmingham" openrent --output my-listings.json
    `);
    process.exit(1);
  }

  const query = args[0];
  const site = args[1] as ScraperConfig['site'];

  if (!['rightmove', 'zoopla', 'openrent', 'spareroom'].includes(site)) {
    console.error(`❌ Invalid site: ${site}. Must be one of: rightmove, zoopla, openrent, spareroom`);
    process.exit(1);
  }

  const config: ScraperConfig = {
    query,
    site,
    maxListings: 20,
    headless: true,
    outputFile: `listings-${site}-${Date.now()}.json`,
  };

  // Parse options
  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--max-listings' && args[i + 1]) {
      config.maxListings = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      config.outputFile = args[i + 1];
      i++;
    } else if (args[i] === '--headless' && args[i + 1]) {
      config.headless = args[i + 1] === 'true';
      i++;
    }
  }

  try {
    console.log(`[Playwright] 🚀 Starting scraper for ${site} with query: "${query}"`);
    console.log(`[Playwright] Configuration:`, {
      maxListings: config.maxListings,
      headless: config.headless,
      outputFile: config.outputFile,
    });

    const listings = await scrapeWithPlaywright(config);

    if (listings.length > 0) {
      saveToJson(listings, config.outputFile!);
      console.log(`[Playwright] ✅ Scraping completed successfully!`);
      console.log(`[Playwright] Total listings extracted: ${listings.length}`);
      console.log(`[Playwright] Source: ${listings[0].source}`);
    } else {
      console.warn(`[Playwright] ⚠️  No listings found. The site structure may have changed.`);
    }

  } catch (error) {
    console.error(`[Playwright] ❌ Fatal error:`, error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { scrapeWithPlaywright, ScraperConfig };

