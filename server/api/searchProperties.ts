/**
 * Unified scraper loader that runs all scrapers in parallel and merges results
 */

import { PropertyListing, SearchQuery, ScraperResult } from '../types.js';
import * as rightmoveScraper from '../scrapers/rightmove.js';
import * as zooplaScraper from '../scrapers/zoopla.js';
import * as openrentScraper from '../scrapers/openrent.js';
import * as spareRoomScraper from '../scrapers/spareRoom.js';

interface ScraperConfig {
  name: string;
  scraper: (query: SearchQuery) => Promise<PropertyListing[]>;
}

const SCRAPERS: ScraperConfig[] = [
  { name: 'rightmove', scraper: rightmoveScraper.scrape },
  { name: 'zoopla', scraper: zooplaScraper.scrape },
  { name: 'openrent', scraper: openrentScraper.scrape },
  { name: 'spareroom', scraper: spareRoomScraper.scrape },
];

/**
 * Generate a unique ID for a property listing based on its attributes
 */
function generateListingId(listing: PropertyListing): string {
  // Use URL as primary identifier if available
  if (listing.url) {
    return `${listing.source}-${listing.url}`;
  }
  
  // Fallback to combination of source, title, price, and location
  const key = `${listing.source}-${listing.title}-${listing.price}-${listing.location}`;
  // Simple hash-like string generation
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `${listing.source}-${Math.abs(hash).toString(36)}`;
}

/**
 * Deduplicate listings based on URL, title, price, and location
 */
function deduplicateListings(listings: PropertyListing[]): PropertyListing[] {
  const seen = new Map<string, PropertyListing>();
  
  for (const listing of listings) {
    const id = generateListingId(listing);
    
    if (!seen.has(id)) {
      seen.set(id, listing);
    } else {
      // If duplicate found, prefer the one with more complete data
      const existing = seen.get(id)!;
      if (
        (!existing.description && listing.description) ||
        (listing.images.length > existing.images.length) ||
        (listing.features && listing.features.length > (existing.features?.length || 0))
      ) {
        seen.set(id, listing);
      }
    }
  }
  
  return Array.from(seen.values());
}

/**
 * Search properties across all scrapers in parallel
 * @param query - Search query parameters
 * @returns Unified array of property listings with deduplication
 */
export async function searchProperties(query: SearchQuery): Promise<{
  listings: PropertyListing[];
  results: ScraperResult[];
  totalFound: number;
}> {
  console.log('[SearchProperties] Starting search across all scrapers...');
  console.log('[SearchProperties] Query:', JSON.stringify(query, null, 2));
  
  // Run all scrapers in parallel using Promise.allSettled
  const scraperPromises = SCRAPERS.map(async (config): Promise<ScraperResult> => {
    const startTime = Date.now();
    console.log(`[SearchProperties] Starting ${config.name} scraper...`);
    
    try {
      const listings = await config.scraper(query);
      const duration = Date.now() - startTime;
      
      if (listings.length > 0) {
        console.log(`[SearchProperties] ✅ ${config.name}: Found ${listings.length} properties in ${duration}ms`);
      } else {
        console.log(`[SearchProperties] ⚠️  ${config.name}: No properties found (${duration}ms)`);
      }
      
      return {
        success: true,
        listings,
        source: config.name,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SearchProperties] ❌ ${config.name} failed after ${duration}ms:`, errorMessage);
      return {
        success: false,
        listings: [],
        error: errorMessage,
        source: config.name,
      };
    }
  });

  const results = await Promise.allSettled(scraperPromises);

  // Extract successful results and handle failures
  const scraperResults: ScraperResult[] = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        success: false,
        listings: [],
        error: result.reason?.message || 'Unknown error',
        source: SCRAPERS[index].name,
      };
    }
  });

  // Merge all listings from successful scrapers
  const allListings: PropertyListing[] = [];
  for (const result of scraperResults) {
    if (result.success) {
      allListings.push(...result.listings);
    }
  }

  // Deduplicate listings
  const uniqueListings = deduplicateListings(allListings);

  // Summary logging
  const successfulScrapers = scraperResults.filter(r => r.success && r.listings.length > 0);
  const failedScrapers = scraperResults.filter(r => !r.success);
  const emptyScrapers = scraperResults.filter(r => r.success && r.listings.length === 0);
  
  console.log('[SearchProperties] ===== Search Summary =====');
  console.log(`[SearchProperties] Total unique listings: ${uniqueListings.length}`);
  console.log(`[SearchProperties] Successful scrapers with results: ${successfulScrapers.length} (${successfulScrapers.map(s => s.source).join(', ')})`);
  console.log(`[SearchProperties] Failed scrapers: ${failedScrapers.length}${failedScrapers.length > 0 ? ` (${failedScrapers.map(s => s.source).join(', ')})` : ''}`);
  console.log(`[SearchProperties] Empty results: ${emptyScrapers.length}${emptyScrapers.length > 0 ? ` (${emptyScrapers.map(s => s.source).join(', ')})` : ''}`);
  console.log('[SearchProperties] =========================');

  return {
    listings: uniqueListings,
    results: scraperResults,
    totalFound: uniqueListings.length,
  };
}

